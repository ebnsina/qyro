import css from './styles.css?inline';
import { template } from './template.js';
import { loadShaka, createPlayer, type Engine } from '../engine/shaka.js';
import { describeError, type PlayerError, type ShakaErrorLike } from '../engine/errors.js';
import { audioOptions, captionOptions, languageName, qualityLabel, qualityOptions, SPEEDS, speedLabel } from '../engine/tracks.js';
import { actionForKey, type KeyAction } from '../controls/keyboard.js';
import { IdleTimer } from '../controls/idle.js';
import { Scrubber, type Range } from '../controls/scrubber.js';
import { parseStoryboard, thumbAt, type Thumb } from '../controls/storyboard.js';
import { autoTrack, CAPTION_BACKGROUNDS, CAPTION_COLORS, CAPTION_SIZES, memory, pickCaption, readStyle, textMime, type CaptionStyle } from '../controls/captions.js';
import { Settings, type Menu } from '../controls/settings.js';
import { tapper } from '../controls/gestures.js';
import { Reveal } from '../controls/reveal.js';
import { Slider } from '../controls/slider.js';
import { ContextMenu, type MenuItem } from '../controls/context-menu.js';
import { statRows, SHORTCUTS } from '../controls/stats.js';
import { chapterAt, loadChapters, type Chapter } from '../controls/chapters.js';
import { icons } from '../controls/icons.js';
import { formatTime, splitStart, timeWidth, withStart } from '../controls/time.js';
import { loadSeyr, type SeyrView } from '../analytics/seyr.js';

declare const __VERSION__: string;
export const version = __VERSION__;

/** Media events from the inner <video>, re-dispatched on <qyro-player>. */
export const MEDIA_EVENTS = [
	'loadstart',
	'loadedmetadata',
	'loadeddata',
	'canplay',
	'canplaythrough',
	'play',
	'playing',
	'pause',
	'waiting',
	'seeking',
	'seeked',
	'timeupdate',
	'durationchange',
	'progress',
	'ratechange',
	'volumechange',
	'ended',
	'enterpictureinpicture',
	'leavepictureinpicture',
] as const;

/** One video in `player.playlist`. Only `src` is needed. */
export interface PlaylistItem {
	src: string;
	title?: string;
	poster?: string;
	/** Seconds, shown in the Up next list. */
	duration?: number;
	/** A WebVTT storyboard, like the `thumbnails` attribute. */
	thumbnails?: string;
	captions?: { src: string; srclang: string; label?: string; default?: boolean }[];
	/** The id analytics reports for this video. */
	videoId?: string;
}

export type { Chapter };

/** Detail of the `chapterchange` event: the chapter now playing, or index -1 and null outside any. */
export interface ChapterChange {
	index: number;
	chapter: Chapter | null;
}

/** Detail of the `qualitychange` event. */
export interface QualityChange {
	height: number;
	width: number;
	/** Bits per second. */
	bitrate: number;
	/** True when Auto picked it. */
	auto: boolean;
}

const IDLE_MS = 2600;
const DOUBLE_TAP_MS = 280;
// Within this many seconds of the window's end counts as live: a fresh join sits a few segments back.
const LIVE_EDGE_S = 10;
/** A live seekable window shorter than this is no DVR: the bar hides and seek keys do nothing. */
const MIN_DVR_S = 30;
/** Menu value for "Auto (device language)". */
const AUTO = -2;
const SKIP_S = 10;
const CRITICAL = 2;
const LOAD_INTERRUPTED = 7000;
const LONG_PRESS_MS = 550;
const STATS_MS = 1000;
/** The panels that open from the right of the player, and the button each opens from; one shows at a time. */
const SIDES = { upnext: '.list', chapters: '.toc' } as const;
type Side = keyof typeof SIDES;

let sheet: CSSStyleSheet | undefined;

function styles(): CSSStyleSheet {
	if (!sheet) {
		sheet = new CSSStyleSheet();
		sheet.replaceSync(css);
	}
	return sheet;
}

// Without a DOM (server rendering) the base is an empty stub, so importing qyro doesn't throw; it is never constructed there.
const Base: typeof HTMLElement = typeof HTMLElement === 'undefined' ? (class {} as never) : HTMLElement;

/**
 * `<qyro-player>`: a Liquid Glass video player around Shaka Player.
 * Plays HLS, DASH and MP4 from `src`; see the README for every attribute, property and event.
 */
export class QyroPlayer extends Base {
	static observedAttributes = ['src', 'poster', 'title', 'autoplay', 'muted', 'loop', 'playsinline', 'start', 'live', 'thumbnails', 'chapters', 'next-at'];

	readonly #root: ShadowRoot;
	readonly #video: HTMLVideoElement;
	readonly #ui: HTMLElement;
	readonly #scrubber: Scrubber;
	readonly #settings: Settings;
	readonly #idle: IdleTimer;
	readonly #volume: Reveal;
	#volumeSlider!: Slider;
	readonly #menu: ContextMenu;
	#remaining = false;
	#timeWidth = '';
	#liveLabel = '';
	#wasLive = false;
	#playlist: PlaylistItem[] = [];
	#index = -1;
	#playNext = false;
	#nextCancelled = false;
	#thumbs: Thumb[] = [];
	#chapters: Chapter[] = [];
	/** Chapters set from script; they win over the attribute, the track and the stream. */
	#ownChapters: Chapter[] | null = null;
	#chaptersId = 0;
	#chapter: Chapter | null = null;
	#captionStyle: CaptionStyle = readStyle();
	#thumbsFor = '';
	#statsTimer: ReturnType<typeof setInterval> | undefined;
	#toastTimer: ReturnType<typeof setTimeout> | undefined;
	#overControls = false;
	readonly #sr: HTMLElement;

	#player: Engine | null = null;
	#ready!: Promise<Engine>;
	#resolveReady!: (p: Engine) => void;
	#rejectReady!: (e: unknown) => void;
	#seyr: SeyrView | null = null;
	#error: PlayerError | null = null;
	#loadId = 0;
	#loadQueued = false;
	#loadedSrc: string | null = null;
	#rate = 1;
	#lastCaption: number | null = null;
	#frame = 0;
	#teardown: (() => void)[] = [];

	constructor() {
		super();
		this.#root = this.attachShadow({ mode: 'open', delegatesFocus: false });
		this.#root.adoptedStyleSheets = [styles()];
		this.#root.innerHTML = template;
		const q = <T extends HTMLElement = HTMLElement>(s: string) => this.#root.querySelector<T>(s)!;
		this.#ui = q('.root');
		this.#video = q<HTMLVideoElement>('video');
		this.#sr = q('.sr');
		this.#newReady();

		this.#scrubber = new Scrubber(q('.scrubber'), {
			range: () => this.#range(),
			label: (t) => this.#timeLabel(t),
			seek: (t) => this.seek(t),
			dragging: (on) => (on ? this.#idle.hold() : this.#activity()),
			thumb: (t) => thumbAt(this.#thumbs, t),
			chapter: (t) => this.#chapters[chapterAt(this.#chapters, t)]?.title ?? '',
		});
		this.#settings = new Settings(q('.sheet'), q('.gear'), () => this.#menus(), (open) => {
			this.#flag('settings', open);
			const side = this.#sideOpen();
			if (open && side) this.#side(side, false);
			if (open) this.#idle.hold();
			else this.#activity();
		});
		this.#idle = new IdleTimer(
			IDLE_MS,
			() => {
				this.#flag('idle', true);
				this.#settings.close();
			},
			() => this.#flag('idle', false),
			() => this.#canHide(),
		);
		this.#volume = new Reveal(q('.volume'), () => this.#activity());
		this.#menu = new ContextMenu(q('.menu'), this.#ui, () => this.#menuItems(), `Qyro Player v${version}`, (open) => {
			this.#flag('menu', open);
			this.#activity();
		});
		this.#wireControls();
		this.#wireVideo();
		this.#applyCaptionStyle();
	}

	// ---------- Lifecycle ----------

	connectedCallback(): void {
		// Properties set before the element was defined sit on the instance and hide our setters; replay them.
		for (const prop of ['src', 'poster', 'autoplay', 'loop', 'muted', 'playsInline', 'start', 'volume', 'playlist', 'chapters'] as const) {
			if (!Object.prototype.hasOwnProperty.call(this, prop)) continue;
			const value = (this as Record<string, unknown>)[prop];
			delete (this as Record<string, unknown>)[prop];
			(this as Record<string, unknown>)[prop] = value;
		}
		if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
		if (!this.hasAttribute('role')) this.setAttribute('role', 'region');
		this.#syncLabel();
		this.#listen(document, 'fullscreenchange', () => this.#onFullscreen());
		this.#listen(document, 'webkitfullscreenchange', () => this.#onFullscreen());
		// Coming back online resumes a stream that lost its connection.
		this.#listen(window, 'online', () => (this.#error?.kind == 'offline' || this.#error?.kind == 'network') && this.retry());
		this.#listen(this, 'keydown', (e) => {
			this.#activity();
			this.#onKey(e as KeyboardEvent);
		});
		this.#listen(this, 'focusin', () => this.#activity());
		// <track> children added or removed later: load again from the same moment, playing if it was.
		const tracks = new MutationObserver((changes) => {
			const touched = changes.some((c) => [...c.addedNodes, ...c.removedNodes].some((n) => n.nodeName == 'TRACK'));
			if (touched && this.#loadedSrc) void this.#load(this.#video.currentTime, !this.#video.paused);
		});
		tracks.observe(this, { childList: true });
		this.#teardown.push(() => tracks.disconnect());
		this.#start();
	}

	disconnectedCallback(): void {
		this.#teardown.splice(0).forEach((off) => off());
		this.#idle.stop();
		cancelAnimationFrame(this.#frame);
		clearInterval(this.#statsTimer);
		this.#seyr?.destroy();
		this.#seyr = null;
		const p = this.#player;
		this.#player = null;
		this.#loadedSrc = null;
		this.#loadId++;
		this.#newReady();
		p?.destroy().catch(() => {}); // the element is gone; nothing is left to show or retry
	}

	attributeChangedCallback(name: string, old: string | null, value: string | null): void {
		const v = this.#video;
		switch (name) {
			case 'src':
				if (old !== value) this.#queueLoad();
				break;
			case 'thumbnails':
				void this.#loadThumbs();
				break;
			case 'chapters':
				if (old !== value) void this.#loadChapters();
				break;
			case 'title':
				this.#syncLabel();
				break;
			case 'poster':
				if (value) v.poster = value;
				else v.removeAttribute('poster');
				break;
			case 'muted':
				v.muted = value !== null;
				break;
			case 'loop':
				v.loop = value !== null;
				break;
			case 'playsinline':
				v.playsInline = value != 'false';
				break;
		}
	}

	async #start(): Promise<void> {
		const id = this.#loadId;
		this.#flag('buffering', !!this.src);
		try {
			const shaka = await loadShaka();
			if (!shaka.Player.isBrowserSupported()) throw Object.assign(new Error('unsupported'), { category: 4, code: 4032 });
			const player = await createPlayer(shaka, this.#video, this.#root.querySelector('.stage')!);
			if (id != this.#loadId || !this.isConnected) return void player.destroy();
			this.#player = player;
			this.#wirePlayer(player);
			await this.#startSeyr(player);
			this.#resolveReady(player);
			this.#queueLoad();
		} catch (e) {
			this.#rejectReady(e);
			this.#fail(e);
		}
	}

	#newReady(): void {
		this.#ready = new Promise((res, rej) => {
			this.#resolveReady = res;
			this.#rejectReady = rej;
		});
		this.#ready.catch(() => {});
	}

	async #startSeyr(player: Engine): Promise<void> {
		const key = this.getAttribute('seyr-key');
		if (!key) return;
		const video = this.#seyrMeta();
		if (!video.id) return console.warn('qyro: seyr-key is set but video-id is missing, so this video is not tracked');
		const host = this.getAttribute('seyr-host') ?? undefined;
		try {
			const sdk = await loadSeyr(host);
			if (this.#player != player) return;
			this.#seyr = sdk.monitor(sdk.shaka(player, this.#video), { key, host, video, player: { name: 'Qyro', software: 'qyro', version } });
		} catch (e) {
			// Analytics must never stop playback, so this is logged and the video plays on.
			console.warn('qyro: Seyr analytics did not start; check seyr-key and seyr-host', e);
		}
	}

	#seyrMeta() {
		return {
			id: this.getAttribute('video-id') ?? '',
			title: this.getAttribute('title') ?? undefined,
			series: this.getAttribute('series') ?? undefined,
		};
	}

	// Batches attribute changes made in the same task (src, video-id, title) into one load.
	#queueLoad(): void {
		if (this.#loadQueued) return;
		this.#loadQueued = true;
		queueMicrotask(() => {
			this.#loadQueued = false;
			if (this.#player) void this.#load();
		});
	}

	async #load(startAt?: number, resume = startAt !== undefined): Promise<void> {
		const player = this.#player!;
		const { src, start } = splitStart(this.src);
		if (src == this.#loadedSrc && startAt === undefined) return;
		const id = ++this.#loadId;
		const first = this.#loadedSrc === null;
		this.#loadedSrc = src;
		this.#clearError();
		this.#flag('fresh', true);
		this.#flag('paused', true);
		this.#flag('live', false);
		this.#idle.hold();
		this.#settings.close();
		if (!src) {
			this.#flag('buffering', false);
			await player.unload();
			return;
		}
		if (this.#seyr && !first && startAt === undefined) {
			const video = this.#seyrMeta();
			if (video.id) this.#seyr.change({ video });
		}
		this.#flag('buffering', true);
		try {
			await player.load(src, startAt ?? start ?? this.start ?? null);
			if (id != this.#loadId) return;
			this.#wasLive = this.live;
			this.#flag('live', this.#wasLive);
			this.#flag('no-dvr', false);
			this.#timeWidth = '';
			this.#liveLabel = '';
			await this.#addTracks(player);
			await this.#addItemCaptions(player);
			await this.#loadThumbs();
			await this.#loadChapters();
			this.#refresh();
			if (this.autoplay || resume || this.#playNext) this.play().catch(() => {});
			this.#playNext = false;
		} catch (e) {
			if (id != this.#loadId || (e as ShakaErrorLike).code == LOAD_INTERRUPTED) return;
			this.#fail(e);
		} finally {
			if (id == this.#loadId) this.#flag('buffering', false);
		}
	}

	/** Storyboard thumbnails: the `thumbnails` WebVTT first, else the stream's own image track. */
	async #loadThumbs(): Promise<void> {
		const url = this.getAttribute('thumbnails');
		const key = `${url}|${this.src}`;
		if (key == this.#thumbsFor) return;
		this.#thumbsFor = key;
		this.#thumbs = [];
		try {
			if (url) {
				const res = await fetch(url);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const list = parseStoryboard(await res.text(), new URL(url, location.href).href);
				if (key == this.#thumbsFor) this.#thumbs = list;
			} else if (this.#player?.getImageTracks().length) {
				const all = (await this.#player.getAllThumbnails()) ?? [];
				if (key == this.#thumbsFor)
					this.#thumbs = all
						.filter((t) => t.uris[0] && !t.startByte)
						.map((t) => ({ start: t.startTime, end: t.startTime + t.duration, url: t.uris[0], x: t.positionX, y: t.positionY, w: t.sprite ? t.width : 0, h: t.sprite ? t.height : 0 }));
			}
			Scrubber.preload(this.#thumbs);
		} catch (e) {
			// The preview falls back to the time alone; tell the developer their storyboard is broken.
			console.warn(`qyro: couldn't load the thumbnails ${url}`, e);
		}
	}

	async #addTracks(player: Engine): Promise<void> {
		const tracks = [...this.querySelectorAll('track')].filter((t) => t.kind != 'chapters');
		for (const t of tracks) {
			if (!t.src) continue;
			try {
				const added = await player.addTextTrackAsync(t.src, t.srclang || 'und', t.kind || 'subtitles', textMime(t.src), undefined, t.label || undefined);
				if (t.default) player.selectTextTrack(added);
			} catch (e) {
				console.warn(`qyro: couldn't load the <track> ${t.src}; check the URL and that it is WebVTT, SRT or TTML`, e);
			}
		}
		// The viewer's remembered choice beats the page's default.
		const texts = player.getTextTracks();
		const pick = pickCaption(texts, memory.get('captions'));
		if (pick !== undefined) player.selectTextTrack(texts.find((t) => t.id == pick?.id) ?? null);
	}

	/** Chapters: from script first, then the `chapters` attribute, a `<track kind="chapters">`, then the stream's own. */
	async #loadChapters(): Promise<void> {
		const id = ++this.#chaptersId;
		if (this.#ownChapters) return this.#setChapters(this.#ownChapters);
		const url = this.getAttribute('chapters') || [...this.querySelectorAll('track')].find((t) => t.kind == 'chapters' && t.src)?.src;
		let list: Chapter[] = [];
		try {
			if (url) list = await loadChapters(url, document.baseURI);
			else {
				const p = this.#player;
				for (const track of p?.getChaptersTracks() ?? []) {
					list = (await p!.getChaptersAsync(track.language)).map((c) => ({ start: c.startTime, end: c.endTime, title: c.title }));
					if (list.length) break;
				}
			}
		} catch (e) {
			// The video plays on without chapters; tell the developer their file is broken.
			console.warn(`qyro: couldn't load the chapters ${url ?? 'from the stream'}; check the URL and that it is WebVTT`, e);
		}
		if (id == this.#chaptersId) this.#setChapters(list);
	}

	#setChapters(list: Chapter[]): void {
		this.#chapters = [...list].sort((a, b) => a.start - b.start);
		this.#paintChapters();
		this.#paint();
	}

	#chooseCaption(track: { id: number; language: string; label: string | null } | null, choice: string): void {
		this.#player?.selectTextTrack(this.#player.getTextTracks().find((t) => t.id == track?.id) ?? null);
		memory.set('captions', choice);
		this.#say(track ? `Captions on: ${track.label || track.language}` : 'Captions off');
		this.#refresh();
	}

	#applyCaptionStyle(): void {
		const s = this.#captionStyle;
		this.#ui.style.setProperty('--_cc-scale', String(CAPTION_SIZES[s.size]?.value ?? 1));
		this.#ui.style.setProperty('--_cc-bg', CAPTION_BACKGROUNDS[s.background]?.value ?? CAPTION_BACKGROUNDS[1].value);
		this.#ui.style.setProperty('--_cc-color', CAPTION_COLORS[s.color]?.value ?? '#fff');
		this.#ui.toggleAttribute('data-cc-outline', s.background == 0);
		this.#ui.toggleAttribute('data-cc-glass', s.background == 1);
	}

	// ---------- Public API ----------

	/** Resolves with the Shaka player once it exists. */
	get ready(): Promise<Engine> {
		return this.#ready;
	}

	/** Advanced: the playback engine instance (a Shaka Player), or null before it loads. */
	get engine(): Engine | null {
		return this.#player;
	}

	/** The inner <video> element. */
	get video(): HTMLVideoElement {
		return this.#video;
	}

	/** The current error, or null while playback is fine. */
	get error(): PlayerError | null {
		return this.#error;
	}

	get src(): string {
		return this.getAttribute('src') ?? '';
	}
	set src(v: string) {
		this.setAttribute('src', v);
	}

	get poster(): string {
		return this.getAttribute('poster') ?? '';
	}
	set poster(v: string) {
		this.setAttribute('poster', v);
	}

	get autoplay(): boolean {
		return this.hasAttribute('autoplay');
	}
	set autoplay(v: boolean) {
		this.toggleAttribute('autoplay', v);
	}

	get loop(): boolean {
		return this.hasAttribute('loop');
	}
	set loop(v: boolean) {
		this.toggleAttribute('loop', v);
	}

	/** On by default so iPhone plays inside the page; `playsinline="false"` lets it take over the screen. */
	get playsInline(): boolean {
		return this.getAttribute('playsinline') != 'false';
	}
	set playsInline(v: boolean) {
		this.setAttribute('playsinline', String(v));
	}

	/** Start time in seconds for the next load, from the `start` attribute. */
	get start(): number | null {
		const s = this.getAttribute('start');
		const n = s === null || s.trim() === '' ? NaN : Number(s);
		return Number.isFinite(n) && n >= 0 ? n : null;
	}
	set start(v: number | null) {
		if (v === null) this.removeAttribute('start');
		else this.setAttribute('start', String(v));
	}

	get muted(): boolean {
		return this.#video.muted;
	}
	set muted(v: boolean) {
		this.#video.muted = v;
	}

	get volume(): number {
		return this.#video.volume;
	}
	set volume(v: number) {
		this.#video.volume = Math.min(1, Math.max(0, v));
	}

	get currentTime(): number {
		return this.#video.currentTime;
	}
	set currentTime(t: number) {
		this.seek(t);
	}

	/** Seconds; Infinity for live streams. */
	get duration(): number {
		return this.#player?.isLive() ? Infinity : this.#video.duration;
	}

	get paused(): boolean {
		return this.#video.paused;
	}

	get ended(): boolean {
		return this.#video.ended;
	}

	/** Live streams are found on their own; the `live` attribute forces it. */
	get live(): boolean {
		return this.hasAttribute('live') || !!this.#player?.isLive();
	}

	get playbackRate(): number {
		return this.#rate;
	}
	set playbackRate(r: number) {
		this.#rate = r;
		this.#video.playbackRate = r;
	}

	play(): Promise<void> {
		return this.#video.play();
	}

	pause(): void {
		this.#video.pause();
	}

	togglePlay(): void {
		if (this.#video.paused || this.#video.ended) {
			// A refusal (autoplay rules) leaves the play button up; real playback failures arrive as error events.
			this.play().catch(() => {});
		} else this.pause();
	}

	/** Seeks to `t` seconds, kept inside the seekable range. */
	seek(t: number): void {
		const r = this.#range();
		this.#video.currentTime = Math.min(Math.max(t, r.start), Math.max(r.start, r.end - 0.1));
	}

	goToLive(): void {
		if (!this.live) return;
		// Let the playhead glide to the edge instead of jumping.
		const bar = this.#root.querySelector<HTMLElement>('.scrubber')!;
		bar.setAttribute('data-jump', '');
		setTimeout(() => bar.removeAttribute('data-jump'), 700);
		this.#player?.goToLive();
		this.#say('Back to live');
	}

	/** Adds a WebVTT or other text track Shaka understands. */
	async addTextTrack(src: string, language: string, label?: string, kind = 'subtitles'): Promise<void> {
		const p = await this.#ready;
		await p.addTextTrackAsync(src, language, kind, textMime(src), undefined, label);
		this.#refresh();
	}

	get fullscreen(): boolean {
		return document.fullscreenElement == this || (document as { webkitFullscreenElement?: Element }).webkitFullscreenElement == this;
	}

	async toggleFullscreen(): Promise<void> {
		type Webkit = { webkitEnterFullscreen?(): void; webkitRequestFullscreen?(): Promise<void>; webkitExitFullscreen?(): Promise<void> };
		const v = this.#video as HTMLVideoElement & Webkit;
		const self = this as this & Webkit;
		const doc = document as Document & Webkit;
		try {
			if (this.fullscreen) await (doc.exitFullscreen ? doc.exitFullscreen() : doc.webkitExitFullscreen?.());
			else if (self.requestFullscreen) await self.requestFullscreen({ navigationUI: 'hide' });
			else if (self.webkitRequestFullscreen) await self.webkitRequestFullscreen();
			// iPhone only lets the video itself go full screen, with the system's own controls.
			else v.webkitEnterFullscreen?.();
		} catch {
			this.#say("Full screen isn't available here");
		}
	}

	async togglePictureInPicture(): Promise<void> {
		try {
			const v = this.#video as HTMLVideoElement & { webkitPresentationMode?: string; webkitSetPresentationMode?(m: string): void };
			if (!v.requestPictureInPicture && v.webkitSetPresentationMode) {
				// Older iOS Safari: the prefixed presentation mode is the only way in.
				v.webkitSetPresentationMode(v.webkitPresentationMode == 'picture-in-picture' ? 'inline' : 'picture-in-picture');
			} else if (document.pictureInPictureElement == v) await document.exitPictureInPicture();
			else await v.requestPictureInPicture();
		} catch (e) {
			this.#say("Picture in picture isn't available here");
		}
	}

	/** Reloads after an error, resuming where playback stopped. */
	retry(): void {
		if (!this.#player) {
			this.#clearError();
			this.#loadId++;
			void this.#start();
			return;
		}
		void this.#load(this.#video.currentTime || this.start || 0);
	}

	// ---------- Wiring ----------

	#listen(target: EventTarget, type: string, fn: (e: Event) => void): void {
		target.addEventListener(type, fn);
		this.#teardown.push(() => target.removeEventListener(type, fn));
	}

	#wireVideo(): void {
		const v = this.#video;
		for (const name of MEDIA_EVENTS) v.addEventListener(name, () => this.dispatchEvent(new Event(name)));
		v.addEventListener('play', () => {
			this.#flag('ended', false);
			this.#flag('paused', false);
			this.#flag('fresh', false);
			this.#activity();
			this.#tick();
		});
		v.addEventListener('pause', () => {
			this.#flag('paused', true);
			this.#idle.hold();
			this.#paint();
		});
		v.addEventListener('ended', () => {
			this.#flag('ended', true);
			this.#idle.hold();
			if (this.#wasLive) this.#notice('This live stream has ended', 'Thanks for watching.');
			if (this.#advances()) this.next();
		});
		v.addEventListener('seeking', () => this.#flag('ended', false));
		v.addEventListener('seeked', () => this.#paint());
		v.addEventListener('progress', () => this.#paint());
		v.addEventListener('durationchange', () => {
			this.#paintChapters();
			this.#paint();
		});
		v.addEventListener('timeupdate', () => this.#paint());
		v.addEventListener('loadedmetadata', () => {
			this.#paint();
			this.#fit();
		});
		v.addEventListener('resize', () => this.#fit());
		new ResizeObserver(() => this.#fit()).observe(this);
		v.addEventListener('volumechange', () => this.#paintVolume());
		v.addEventListener('ratechange', () => v.playbackRate && (this.#rate = v.playbackRate));
		v.addEventListener('enterpictureinpicture', () => this.#flag('pip', true));
		v.addEventListener('leavepictureinpicture', () => this.#flag('pip', false));
		this.#paintVolume();
	}

	#wirePlayer(p: Engine): void {
		const on = (type: string, fn: (e: Event & Record<string, unknown>) => void) => p.addEventListener(type, fn as never);
		on('buffering', (e) => this.#flag('buffering', !!e.buffering));
		on('error', (e) => {
			const detail = e.detail as ShakaErrorLike & { severity?: number };
			if (detail?.severity == CRITICAL) this.#fail(detail);
		});
		for (const t of ['trackschanged', 'variantchanged', 'adaptation', 'textchanged', 'abrstatuschanged', 'audiotrackschanged']) on(t, () => this.#refresh());
		// One public event for any rendition change, picked by the viewer or by Auto.
		let last = '';
		const quality = () => {
			const t = p.getVariantTracks().find((v) => v.active);
			if (!t?.height) return;
			const detail: QualityChange = { height: t.height, width: t.width ?? 0, bitrate: t.bandwidth, auto: p.getConfiguration().abr.enabled };
			const key = `${detail.height}|${detail.bitrate}|${detail.auto}`;
			if (key == last) return;
			last = key;
			this.dispatchEvent(new CustomEvent<QualityChange>('qualitychange', { detail }));
		};
		for (const t of ['adaptation', 'variantchanged', 'trackschanged', 'abrstatuschanged']) on(t, quality);
	}

	#wireControls(): void {
		const q = <T extends HTMLElement = HTMLElement>(s: string) => this.#root.querySelector<T>(s)!;
		const click = (s: string, fn: () => void) =>
			this.#root.querySelectorAll(s).forEach((el) =>
				el.addEventListener('click', (e) => {
					e.stopPropagation();
					fn();
					this.#activity();
				}),
			);
		click('.play', () => this.togglePlay());
		click('.big-play', () => this.togglePlay());
		click('.skip[data-action="back"]', () => this.#skip(-SKIP_S));
		click('.skip[data-action="forward"]', () => this.#skip(SKIP_S));
		click('.mute', () => {
			this.muted = !this.muted;
			if (!this.muted && this.volume == 0) this.volume = 0.5;
		});
		click('.cc', () => this.#toggleCaptions());
		click('.gear', () => this.#settings.toggle());
		click('.pip', () => void this.togglePictureInPicture());
		click('.fs', () => void this.toggleFullscreen());
		click('.live', () => this.goToLive());
		click('.retry', () => this.retry());
		click('.duration', () => {
			this.#remaining = !this.#remaining;
			q('.duration').setAttribute('aria-label', this.#remaining ? 'Show duration' : 'Show time remaining');
			this.#paint();
		});
		click('.stats .panel-close', () => this.#panel('stats', false));
		click('.keys .panel-close', () => this.#panel('keys', false));
		click('.prev', () => this.previous());
		click('.next', () => this.next());
		click('.list', () => this.#side('upnext', this.#sideOpen() != 'upnext'));
		click('.upnext .panel-close', () => this.#side('upnext', false, true));
		click('.toc', () => this.#side('chapters', this.#sideOpen() != 'chapters'));
		click('.chapters .panel-close', () => this.#side('chapters', false, true));
		click('.next-play', () => this.next());
		click('.next-cancel', () => {
			this.#nextCancelled = true;
			this.#flag('next-card', false);
			this.#say('Up next canceled');
		});
		q('.upnext-list').addEventListener('click', (e) => {
			const b = (e.target as Element).closest<HTMLElement>('[data-index]');
			if (!b) return;
			this.#go(Number(b.dataset.index), true);
			this.#side('upnext', false);
		});
		q('.chapter-list').addEventListener('click', (e) => {
			const b = (e.target as Element).closest<HTMLElement>('[data-index]');
			if (!b) return;
			this.seekToChapter(Number(b.dataset.index));
			this.play().catch(() => {});
			this.#side('chapters', false, true);
		});
		q('.keys-list').innerHTML = SHORTCUTS.map(([k, what]) => `<dt>${k}</dt><dd>${what}</dd>`).join('');

		this.#volumeSlider = new Slider(q('.volume-slider'), {
			change: (f) => {
				this.volume = f;
				this.muted = f == 0;
			},
			dragging: () => this.#activity(),
		});

		q('.pip').hidden = !document.pictureInPictureEnabled && !(this.#video as { webkitSupportsPresentationMode?: unknown }).webkitSupportsPresentationMode;
		this.#video.playsInline = true;
		const canFullscreen = document.fullscreenEnabled || !!(this.#video as { webkitEnterFullscreen?: unknown }).webkitEnterFullscreen;
		q('.fs').hidden = !canFullscreen;

		// The dock's height lifts the captions and places the settings sheet above it.
		new ResizeObserver(([entry]) => this.#ui.style.setProperty('--_dock-height', `${entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height}px`)).observe(q('.dock'));

		const surface = q('.surface');
		const ui = this.#ui;
		ui.addEventListener('pointermove', (e) => e.pointerType == 'mouse' && this.#activity());
		// Leaving the player hides the controls at once, unless #canHide says something still needs them.
		ui.addEventListener('pointerleave', (e) => e.pointerType == 'mouse' && this.#idle.sleep());
		const dock = q('.dock');
		dock.addEventListener('pointerenter', (e) => {
			if (e.pointerType == 'touch') return;
			this.#overControls = true;
			this.#idle.hold();
		});
		dock.addEventListener('pointerleave', (e) => {
			if (e.pointerType == 'touch') return;
			this.#overControls = false;
			this.#activity();
		});

		const tap = tapper<PointerEvent>(
			DOUBLE_TAP_MS,
			() => {
				if (this.#settings.isOpen) return this.#settings.close();
				if (this.#idle.idle) this.#activity();
				else if (!this.paused) this.#idle.sleep();
			},
			(e) => {
				const box = surface.getBoundingClientRect();
				const x = (e.clientX - box.left) / box.width;
				if (x < 1 / 3) this.#skip(-SKIP_S, true);
				else if (x > 2 / 3) this.#skip(SKIP_S, true);
			},
		);
		let pointer = '';
		let downOnSurface = false;
		let press: ReturnType<typeof setTimeout> | undefined;
		let pressAt = { x: 0, y: 0 };
		const cancelPress = () => clearTimeout(press);
		// A drag that started on a slider and ended over the video is not a click on the video.
		surface.addEventListener('pointerdown', (e) => {
			// A press outside the Up next or Chapters list closes it and does nothing else.
			const side = this.#sideOpen();
			if (side) {
				this.#side(side, false);
				downOnSurface = false;
				return;
			}
			downOnSurface = true;
			if (e.pointerType != 'touch') return;
			// Touch has no right click: a long press opens the menu, and the lift that ends it is not a tap.
			pressAt = { x: e.clientX, y: e.clientY };
			press = setTimeout(() => {
				downOnSurface = false;
				this.#menu.open(pressAt.x, pressAt.y);
			}, LONG_PRESS_MS);
		});
		surface.addEventListener('pointermove', (e) => Math.hypot(e.clientX - pressAt.x, e.clientY - pressAt.y) > 10 && cancelPress());
		surface.addEventListener('pointercancel', cancelPress);
		ui.addEventListener('contextmenu', (e) => {
			if ((e.composedPath()[0] as Element).closest?.('.panel')) return; // let people copy stats text
			e.preventDefault();
			if (!this.#menu.isOpen) this.#menu.open(e.clientX, e.clientY);
		});
		surface.addEventListener('pointerup', (e) => {
			pointer = e.pointerType;
			cancelPress();
			if (!downOnSurface) return;
			downOnSurface = false;
			if (this.#menu.isOpen) return;
			if (e.pointerType == 'mouse') {
				if (e.button != 0) return;
				if (this.#settings.isOpen) return this.#settings.close();
				this.togglePlay();
				this.#activity();
			} else tap(e);
		});
		// Touch double taps seek; only a mouse double click goes full screen.
		surface.addEventListener('dblclick', () => pointer == 'mouse' && void this.toggleFullscreen());
	}

	// ---------- Behaviour ----------

	#activity(): void {
		this.#idle.poke();
	}

	/** The controls stay while anything is using them. */
	#canHide(): boolean {
		return !(
			this.paused ||
			this.#sideOpen() ||
			this.#error ||
			this.#settings.isOpen ||
			this.#menu.isOpen ||
			this.#scrubber.dragging ||
			this.#volume.open ||
			this.#volume.dragging ||
			this.#overControls ||
			this.#root.querySelector('.dock :focus-visible')
		);
	}

	#onKey(e: KeyboardEvent): void {
		const target = e.composedPath()[0] as HTMLElement;
		if (target.closest?.('.sheet, .menu')) return;
		if (e.key == 'Escape') {
			if (this.#settings.isOpen) return this.#settings.close(true);
			const side = this.#sideOpen();
			if (side) return this.#side(side, false, true);
			if (this.#panelOpen('keys')) return this.#panel('keys', false);
			if (this.#panelOpen('stats')) return this.#panel('stats', false);
		}
		// Inside the Up next or Chapters list, up and down move between rows; nothing else is a shortcut there.
		const panel = target.closest?.('.upnext, .chapters');
		if (panel) {
			const items = [...panel.querySelectorAll<HTMLElement>('[data-index], .panel-close')];
			const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
			if (step) {
				e.preventDefault();
				items[(items.indexOf(target) + step + items.length) % items.length]?.focus();
			}
			return;
		}
		const action = actionForKey(e);
		if (!action) return;
		// Let buttons answer Space and Enter themselves.
		if (e.key == ' ' && target.tagName == 'BUTTON') return;
		e.preventDefault();
		this.#run(action);
	}

	#run(a: KeyAction): void {
		const r = this.#range();
		const seeks = ['seek-by', 'seek-percent', 'seek-start', 'seek-end'];
		if (this.live && r.end - r.start < MIN_DVR_S && seeks.includes(a.type)) return this.#say('This live stream can’t be rewound');
		switch (a.type) {
			case 'toggle-play':
				return this.togglePlay();
			case 'seek-by':
				return this.#skip(a.seconds);
			case 'seek-percent':
				this.seek(r.start + (r.end - r.start) * (a.percent / 100));
				return this.#say(`${a.percent}%`);
			case 'seek-start':
				return this.seek(r.start);
			case 'seek-end':
				return this.live ? this.goToLive() : this.seek(r.end);
			case 'volume-by':
				this.volume = Math.round((this.volume + a.delta) * 100) / 100;
				this.muted = this.volume == 0;
				return this.#say(`Volume ${Math.round(this.volume * 100)}%`);
			case 'toggle-mute':
				this.muted = !this.muted;
				return this.#say(this.muted ? 'Muted' : 'Sound on');
			case 'toggle-fullscreen':
				return void this.toggleFullscreen();
			case 'toggle-captions':
				return this.#toggleCaptions();
			case 'show-shortcuts':
				return this.#panel('keys', !this.#panelOpen('keys'));
			case 'open-menu':
				return this.#menu.open();
			case 'next':
				return this.next();
			case 'previous':
				return this.previous();
		}
	}

	#skip(seconds: number, ripple = false): void {
		this.seek(this.currentTime + seconds);
		this.#say(`${seconds < 0 ? 'Back' : 'Forward'} ${Math.abs(seconds)} seconds`);
		if (ripple) {
			const el = this.#root.querySelector<HTMLElement>(`.ripple[data-side="${seconds < 0 ? 'back' : 'forward'}"]`)!;
			el.removeAttribute('data-on');
			void el.offsetWidth; // restart the wave animation on rapid taps
			el.setAttribute('data-on', '');
			clearTimeout(Number(el.dataset.timer));
			el.dataset.timer = String(setTimeout(() => el.removeAttribute('data-on'), 650));
		}
	}

	// ---------- Chapters ----------

	/** The chapters, sorted by start. Setting them overrides the file and the stream's; `null` goes back to those. */
	get chapters(): Chapter[] {
		return this.#chapters.map((c) => ({ ...c }));
	}
	set chapters(list: Chapter[] | null) {
		const valid = (c: Chapter) => c && Number.isFinite(c.start) && c.start >= 0 && typeof c.title == 'string' && (c.end === undefined || c.end > c.start);
		if (list !== null && (!Array.isArray(list) || !list.every(valid))) {
			throw new TypeError('qyro: chapters must be an array of { start, end?, title } with start in seconds');
		}
		this.#ownChapters = list && list.map((c) => ({ ...c }));
		void this.#loadChapters();
	}

	/** The chapter playing now, or null. */
	get chapter(): Chapter | null {
		const c = this.#chapters[chapterAt(this.#chapters, this.currentTime)];
		return c ? { ...c } : null;
	}

	/** Seeks to the start of chapter `i` (from 0). */
	seekToChapter(i: number): void {
		const c = this.#chapters[i];
		if (!c) throw new RangeError(`qyro: there is no chapter ${i}; this video has ${this.#chapters.length}`);
		this.seek(c.start);
		this.#say(`Chapter: ${c.title}`);
	}

	/** The button, the list in the panel, the current title by the time and the gaps in the seek bar. */
	#paintChapters(): void {
		const list = this.#chapters;
		const q = <T extends HTMLElement = HTMLElement>(s: string) => this.#root.querySelector<T>(s)!;
		q('.toc').hidden = !list.length;
		this.#flag('has-chapters', !!list.length);
		if (!list.length && this.#sideOpen() == 'chapters') this.#side('chapters', false);
		const d = this.#video.duration;
		const scale = Number.isFinite(d) ? d : (list.at(-1)?.start ?? 0);
		const current = this.#chapter ? list.indexOf(this.#chapter) : -1;
		q('.chapter-list').innerHTML = list
			.map((c, i) => `<li><button data-index="${i}" aria-current="${i == current}"><span class="at">${formatTime(c.start, scale)}</span><span class="t">${esc(c.title)}</span></button></li>`)
			.join('');
		q('.chapter-now').innerHTML = list.map((c, i) => `<span${i == current ? ' data-on' : ''}>${esc(c.title)}</span>`).join('');
		// A small cut in the bar where each chapter starts, the bar itself staying as thin as before.
		const r = this.#range();
		const span = r.end - r.start;
		const cuts = this.live || !(span > 0) ? [] : list.map((c) => ((c.start - r.start) / span) * 100).filter((f) => f > 0 && f < 100);
		const mask = cuts.length ? `linear-gradient(to right, ${cuts.map((f) => `#000 calc(${f}% - 1px), transparent 0 calc(${f}% + 1px), #000 0`).join(', ')})` : '';
		const track = q('.scrubber .track');
		track.style.setProperty('mask-image', mask);
		track.style.setProperty('-webkit-mask-image', mask);
	}

	/** Marks the chapter playing at `t` and fires `chapterchange` when it changes. */
	#paintChapter(t: number): void {
		const c = this.#chapters[chapterAt(this.#chapters, t)] ?? null;
		if (c === this.#chapter) return;
		this.#chapter = c;
		const i = c ? this.#chapters.indexOf(c) : -1;
		this.#root.querySelectorAll<HTMLElement>('.chapter-list [data-index]').forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.index) == i)));
		this.#root.querySelectorAll('.chapter-now span').forEach((el, j) => el.toggleAttribute('data-on', j == i));
		this.dispatchEvent(new CustomEvent<ChapterChange>('chapterchange', { detail: { index: i, chapter: c && { ...c } } }));
	}

	// ---------- Playlist ----------

	/** The videos to play in order; setting it starts the first one. An empty list turns it off. */
	get playlist(): PlaylistItem[] {
		return [...this.#playlist];
	}
	set playlist(items: PlaylistItem[]) {
		if (!Array.isArray(items) || items.some((i) => !i || typeof i.src != 'string' || !i.src)) {
			throw new TypeError('qyro: playlist must be an array of items that each have a src');
		}
		this.#playlist = items.map((i) => ({ ...i }));
		this.#index = -1;
		this.dispatchEvent(new CustomEvent('playlistchange', { detail: { length: items.length } }));
		if (items.length) this.#go(0, this.autoplay);
		this.#paintPlaylist();
	}

	/** Which playlist item is playing, or -1 without a playlist. Setting it plays that item. */
	get index(): number {
		return this.#index;
	}
	set index(i: number) {
		this.#go(i, true);
	}

	/** Plays the next video once one ends; on unless `autoadvance="false"`. */
	get autoadvance(): boolean {
		return this.getAttribute('autoadvance') != 'false';
	}
	set autoadvance(on: boolean) {
		this.setAttribute('autoadvance', String(on));
	}

	next(): void {
		if (this.#index < this.#playlist.length - 1) this.#go(this.#index + 1, true);
	}

	/** Back to the start of this video, or to the one before when it has only just started. */
	previous(): void {
		if (this.#video.currentTime > 3 || this.#index <= 0) this.seek(0);
		else this.#go(this.#index - 1, true);
	}

	#go(i: number, play: boolean): void {
		const item = this.#playlist[i];
		if (!item || i == this.#index) return;
		this.#index = i;
		this.#nextCancelled = false;
		this.#playNext = play;
		this.#flag('next-card', false);
		const set = (name: string, v: string | undefined) => (v ? this.setAttribute(name, v) : this.removeAttribute(name));
		set('title', item.title);
		set('poster', item.poster);
		set('thumbnails', item.thumbnails);
		set('video-id', item.videoId);
		this.src = item.src;
		this.dispatchEvent(new CustomEvent('itemchange', { detail: { index: i, item: { ...item } } }));
		this.#paintPlaylist();
	}

	async #addItemCaptions(player: Engine): Promise<void> {
		for (const c of this.#playlist[this.#index]?.captions ?? []) {
			try {
				const t = await player.addTextTrackAsync(c.src, c.srclang, 'subtitles', textMime(c.src), undefined, c.label);
				if (c.default) player.selectTextTrack(t);
			} catch (e) {
				console.warn(`qyro: couldn't load the playlist captions ${c.src}`, e);
			}
		}
	}

	#advances(): boolean {
		return this.autoadvance && !this.#nextCancelled && this.#index >= 0 && this.#index < this.#playlist.length - 1;
	}

	/** In the last 10 seconds, or from `next-at` (say, when the credits start): what's next, counting down. */
	#paintNextCard(t: number): void {
		const d = this.#video.duration;
		if (!this.#advances() || this.live || !Number.isFinite(d)) return this.#flag('next-card', false);
		const at = Number(this.getAttribute('next-at'));
		const from = this.hasAttribute('next-at') && at > 0 ? at : d - 10;
		const until = this.hasAttribute('next-at') && at > 0 ? Math.min(at + 10, d) : d;
		const show = t >= from && t < until && !this.#video.paused;
		this.#flag('next-card', show);
		this.#root.querySelector<HTMLElement>('.next-card')!.inert = !show;
		if (!show) {
			if (this.hasAttribute('next-at') && t >= until && t < d) this.next();
			return;
		}
		this.#root.querySelector('.next-title')!.textContent = this.#playlist[this.#index + 1].title ?? 'Next video';
		this.#root.querySelector('.next-count')!.textContent = `in ${Math.max(0, Math.ceil(until - t))}`;
	}

	#paintPlaylist(): void {
		const on = this.#playlist.length > 1;
		const q = <T extends HTMLElement = HTMLElement>(s: string) => this.#root.querySelector<T>(s)!;
		q('.prev').hidden = !on;
		q('.next').hidden = !on;
		q('.list').hidden = !on;
		q<HTMLButtonElement>('.next').disabled = this.#index >= this.#playlist.length - 1;
		q('.upnext-list').innerHTML = this.#playlist
			.map((item, i) => {
				const pic = item.poster ? ` style="background-image: url('${esc(item.poster)}')"` : '';
				const len = item.duration ? formatTime(item.duration) : '';
				return `<li><button data-index="${i}" aria-current="${i == this.#index}"><span class="n">${i + 1}</span><span class="pic"${pic}></span><span class="meta"><span class="t">${esc(item.title ?? `Video ${i + 1}`)}</span><span class="d">${len}</span></span></button></li>`;
			})
			.join('');
		if (!on) this.#side('upnext', false);
	}

	#sideOpen(): Side | null {
		return (Object.keys(SIDES) as Side[]).find((name) => this.#ui.hasAttribute(`data-${name}`)) ?? null;
	}

	/** Opens or closes the Up next or Chapters panel; opening one closes the other and the settings. */
	#side(name: Side, open: boolean, returnFocus = false): void {
		const el = this.#root.querySelector<HTMLElement>(`.panel.${name}`)!;
		const button = this.#root.querySelector<HTMLElement>(SIDES[name])!;
		const other = this.#sideOpen();
		if (open && other && other != name) this.#side(other, false);
		if (open) this.#settings.close();
		this.#flag(name, open);
		el.inert = !open;
		button.setAttribute('aria-expanded', String(open));
		// Focus once the panel is shown; WebKit won't focus inside it in the same frame.
		if (open) requestAnimationFrame(() => requestAnimationFrame(() => (el.querySelector<HTMLElement>('[aria-current="true"]') ?? el.querySelector<HTMLElement>('[data-index]'))?.focus()));
		else if (returnFocus) button.focus();
		this.#activity();
	}

	#menuItems(): MenuItem[] {
		const v = this.#video;
		return [
			{ id: 'play', label: v.paused ? 'Play' : 'Pause', icon: v.paused ? icons.play : icons.pause, run: () => this.togglePlay() },
			{ id: 'loop', label: 'Loop', icon: icons.loop, checked: this.loop, run: () => (this.loop = !this.loop) },
			{ id: 'copy-url', label: 'Copy video URL', icon: icons.link, hidden: !this.src, run: () => void this.#copy(this.#absolute(splitStart(this.src).src)) },
			{
				id: 'copy-time',
				label: 'Copy URL at current time',
				icon: icons.copy,
				hidden: !this.src || this.live,
				run: () => void this.#copy(withStart(this.#absolute(this.src), v.currentTime)),
			},
			{ id: 'pip', label: 'Picture in picture', icon: icons.pip, hidden: !document.pictureInPictureEnabled, run: () => void this.togglePictureInPicture() },
			{ id: 'stats', label: 'Stats for nerds', icon: icons.stats, checked: this.#panelOpen('stats'), run: () => this.#panel('stats', !this.#panelOpen('stats')) },
			{ id: 'keys', label: 'Keyboard shortcuts', icon: icons.keyboard, run: () => this.#panel('keys', true) },
		];
	}

	#absolute(url: string): string {
		return new URL(url, location.href).href;
	}

	async #copy(text: string): Promise<void> {
		try {
			await navigator.clipboard.writeText(text);
			this.#toast('Link copied');
		} catch (e) {
			this.#toast("Couldn't copy the link");
		}
	}

	#toast(message: string): void {
		const t = this.#root.querySelector<HTMLElement>('.toast')!;
		t.textContent = message;
		t.setAttribute('data-on', '');
		this.#say(message);
		clearTimeout(this.#toastTimer);
		this.#toastTimer = setTimeout(() => t.removeAttribute('data-on'), 1800);
	}

	#panelOpen(name: 'stats' | 'keys'): boolean {
		return this.#ui.hasAttribute(`data-${name}`);
	}

	/** Shows or hides the stats or shortcuts panel; stats refresh every second while shown. */
	#panel(name: 'stats' | 'keys', open: boolean): void {
		const el = this.#root.querySelector<HTMLElement>(`.panel.${name}`)!;
		this.#flag(name, open);
		el.inert = !open;
		if (name == 'stats') {
			clearInterval(this.#statsTimer);
			if (open) {
				this.#paintStats();
				this.#statsTimer = setInterval(() => this.#paintStats(), STATS_MS);
			}
		}
		if (open) el.querySelector<HTMLElement>('.panel-close')?.focus();
		else if (el.contains(this.#root.activeElement)) this.focus();
	}

	#paintStats(): void {
		const p = this.#player;
		const v = this.#video;
		const s = p?.getStats();
		const track = p?.getVariantTracks().find((t) => t.active);
		let ahead = 0;
		for (let i = 0; i < v.buffered.length; i++) if (v.buffered.start(i) <= v.currentTime + 0.5 && v.buffered.end(i) > v.currentTime) ahead = v.buffered.end(i) - v.currentTime;
		const quality = v.getVideoPlaybackQuality?.();
		const rows = statRows({
			width: v.videoWidth,
			height: v.videoHeight,
			frameRate: track?.frameRate ?? null,
			streamBandwidth: track?.bandwidth ?? s?.streamBandwidth ?? NaN,
			estimatedBandwidth: s?.estimatedBandwidth ?? NaN,
			bufferAhead: ahead,
			droppedFrames: quality?.droppedVideoFrames ?? s?.droppedFrames ?? 0,
			decodedFrames: quality?.totalVideoFrames ?? s?.decodedFrames ?? 0,
			codecs: s?.currentCodecs || [track?.videoCodec, track?.audioCodec].filter(Boolean).join(', '),
			live: this.live,
			liveLatency: s?.liveLatency ?? NaN,
		});
		this.#root.querySelector('.stats-list')!.innerHTML = rows.map(([k, val]) => `<dt>${k}</dt><dd>${val.replace(/</g, '&lt;')}</dd>`).join('');
	}

	#toggleCaptions(): void {
		const p = this.#player;
		if (!p) return;
		const tracks = p.getTextTracks().filter((t) => !t.forced);
		if (!tracks.length) return this.#say('No captions for this video');
		const active = tracks.find((t) => t.active);
		if (active) {
			this.#lastCaption = active.id;
			return this.#chooseCaption(null, 'off');
		}
		const pick = tracks.find((t) => t.id == this.#lastCaption) ?? autoTrack(tracks) ?? tracks[0];
		this.#chooseCaption(pick, pick.language);
	}

	/** Off, then Auto when the device language has a track, then each language. */
	#captionMenu() {
		const p = this.#player;
		if (!p) return [];
		const tracks = p.getTextTracks();
		const list = captionOptions(tracks);
		const auto = autoTrack(tracks);
		if (!auto || list.length < 2) return list;
		const isAuto = memory.get('captions') == 'auto' && auto.active;
		list.splice(1, 0, { value: AUTO, label: `Auto (${auto.label || languageName(auto.language)})`, active: isAuto });
		if (isAuto) list.forEach((o) => o.value != AUTO && (o.active = false));
		return list;
	}

	/** Size, background and color for captions, shown once the video has any. */
	#styleMenus(): Menu[] {
		const p = this.#player;
		if (!p || !p.getTextTracks().some((t) => !t.forced)) return [];
		const menu = (id: keyof CaptionStyle, label: string, choices: { label: string }[]): Menu => ({
			id: `cc-${id}`,
			label,
			options: () => choices.map((c, i) => ({ value: i, label: c.label, active: this.#captionStyle[id] == i })),
			value: () => choices[this.#captionStyle[id]]?.label ?? '',
			select: (i) => {
				this.#captionStyle = { ...this.#captionStyle, [id]: i };
				memory.set('caption-style', JSON.stringify(this.#captionStyle));
				this.#applyCaptionStyle();
				this.#refresh();
			},
		});
		const parts = [menu('size', 'Size', CAPTION_SIZES), menu('background', 'Background', CAPTION_BACKGROUNDS), menu('color', 'Text color', CAPTION_COLORS)];
		const style = CAPTION_SIZES[this.#captionStyle.size]?.label ?? '';
		return [{ id: 'cc-style', label: 'Caption style', options: () => [], value: () => style, select: () => {}, more: () => parts }];
	}

	#menus(): Menu[] {
		const p = this.#player;
		if (!p) return [];
		const variants = () => qualityOptions(p.getVariantTracks());
		const abr = () => p.getConfiguration().abr.enabled;
		const current = () => qualityLabel(p.getVariantTracks().find((t) => t.active) ?? { height: null, frameRate: null });
		return [
			{
				id: 'quality',
				label: 'Quality',
				options: () => {
					const list = variants();
					if (!list.length) return [];
					const auto = { value: -1, label: 'Auto', badge: abr() ? current() || undefined : undefined, active: abr() };
					return [auto, ...list.map((o) => ({ ...o, active: !abr() && o.active }))];
				},
				value: () => (abr() ? `Auto${current() ? ` (${current()})` : ''}` : current()),
				select: (id) => {
					if (id == -1) {
						p.configure({ abr: { enabled: true } });
						this.#say('Quality: Auto');
					} else {
						const track = p.getVariantTracks().find((t) => t.id == id);
						if (!track) return;
						p.configure({ abr: { enabled: false } });
						p.selectVariantTrack(track, true);
						this.#say(`Quality: ${qualityLabel(track)}`);
					}
					this.#refresh();
				},
			},
			{
				id: 'speed',
				label: 'Speed',
				// Live has no speed choice: faster can't pass the edge and slower only drifts behind it.
				options: () => (this.live ? [] : SPEEDS).map((s) => ({ value: s, label: speedLabel(s), active: s == this.#rate })),
				value: () => speedLabel(this.#rate),
				select: (s) => {
					this.playbackRate = s;
					this.#say(`Speed: ${speedLabel(s)}`);
					this.#refresh();
				},
			},
			{
				id: 'captions',
				label: 'Captions',
				options: () => this.#captionMenu(),
				value: () => this.#captionMenu().find((o) => o.active)?.label ?? 'Off',
				select: (id) => {
					const tracks = p.getTextTracks();
					if (id == AUTO) return this.#chooseCaption(autoTrack(tracks) ?? null, 'auto');
					const track = tracks.find((t) => t.id == id) ?? null;
					this.#chooseCaption(track, track ? track.language : 'off');
				},
				more: () => this.#styleMenus(),
			},

			{
				id: 'audio',
				label: 'Audio',
				options: () => audioOptions(p.getAudioTracks()),
				value: () => audioOptions(p.getAudioTracks()).find((o) => o.active)?.label ?? '',
				select: (i) => {
					const track = p.getAudioTracks()[i];
					if (!track) return;
					p.selectAudioTrack(track);
					this.#say(`Audio: ${track.label || track.language}`);
					this.#refresh();
				},
			},
		];
	}

	/** Track lists or choices changed: update the captions button and any open menu. */
	#refresh(): void {
		const p = this.#player;
		const cc = this.#root.querySelector<HTMLElement>('.cc')!;
		const text = p ? p.getTextTracks().filter((t) => !t.forced) : [];
		cc.hidden = !text.length;
		cc.setAttribute('aria-pressed', String(text.some((t) => t.active)));
		this.#root.querySelector<HTMLElement>('.gear')!.hidden = !p || !this.#settings.visible().length;
		this.#settings.render();
	}

	#range(): Range {
		const p = this.#player;
		if (p?.isLive()) return p.seekRange();
		const d = this.#video.duration;
		return { start: 0, end: Number.isFinite(d) ? d : 0 };
	}

	#timeLabel(t: number): string {
		const r = this.#range();
		if (!this.live) return formatTime(t, r.end - r.start);
		const behind = r.end - t;
		return behind < LIVE_EDGE_S ? 'Live' : `-${formatTime(behind, r.end - r.start)}`;
	}

	// Smooth progress while playing and visible; timeupdate alone moves the bar in 250ms steps.
	#tick = () => {
		cancelAnimationFrame(this.#frame);
		if (this.paused || !this.isConnected) return;
		if (!this.#idle.idle) this.#paint();
		this.#frame = requestAnimationFrame(this.#tick);
	};

	#paint(): void {
		const v = this.#video;
		const t = v.currentTime;
		let buffered = 0;
		for (let i = 0; i < v.buffered.length; i++) if (v.buffered.start(i) <= t + 0.5) buffered = v.buffered.end(i);
		// At the live edge the bead sits at the end of the window, not a few seconds short of it.
		const edge = this.live ? this.#range().end : 0;
		this.#scrubber.update(this.live && edge - t < LIVE_EDGE_S ? edge : t, buffered);
		this.#paintNextCard(t);
		this.#paintChapter(t);
		const q = (s: string) => this.#root.querySelector(s)!;
		const r = this.#range();
		const scale = r.end - r.start;
		const width = `${timeWidth(scale)}ch`;
		if (width != this.#timeWidth) {
			this.#timeWidth = width;
			q('.timeline').setAttribute('style', `--_time-width: ${width}`);
		}
		if (this.live) {
			// Before the first seek to the edge the playhead can sit far outside the window (0 on an epoch timeline).
			const behind = r.start - t > scale ? 0 : r.end - Math.min(Math.max(t, r.start), r.end);
			// Without a DVR window there's no "behind": the stream is simply live.
			const noDvr = scale < MIN_DVR_S;
			const atLive = behind < LIVE_EDGE_S || noDvr;
			this.#flag('at-live', atLive);
			this.#flag('no-dvr', noDvr);
			// How far behind sits in the pill itself, so the left of the bar never changes.
			const label = atLive ? 'Live' : `-${formatTime(behind, scale)} · Go live`;
			this.#root.querySelectorAll('.live').forEach((l) => l.setAttribute('aria-label', atLive ? 'Playing live' : `${formatTime(behind, scale)} behind live. Go to live`));
			this.#setLiveLabel(label);
		} else {
			q('.current').textContent = formatTime(t, scale);
			q('.duration').textContent = this.#remaining ? `-${formatTime(v.duration - t, scale)}` : formatTime(v.duration, scale);
		}
	}

	// The pill animates between its old and new natural width; CSS can't transition to an auto width.
	#setLiveLabel(label: string): void {
		if (label == this.#liveLabel) return;
		this.#liveLabel = label;
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		this.#root.querySelectorAll<HTMLElement>('.live').forEach((pill) => {
			const from = pill.offsetWidth;
			pill.querySelector('.live-label')!.textContent = label;
			if (!from || still || !pill.closest('.timeline')) return;
			pill.style.width = '';
			const to = pill.offsetWidth;
			if (to == from) return;
			pill.style.width = `${from}px`;
			void pill.offsetWidth;
			pill.style.width = `${to}px`;
			const done = (e: TransitionEvent) => {
				if (e.target != pill || e.propertyName != 'width') return;
				pill.style.width = '';
				pill.removeEventListener('transitionend', done);
			};
			pill.addEventListener('transitionend', done);
		});
	}

	#paintVolume(): void {
		const v = this.#video;
		const level = v.muted ? 0 : v.volume;
		const mute = this.#root.querySelector<HTMLElement>('.mute')!;
		mute.dataset.level = level == 0 ? 'off' : level < 0.5 ? 'low' : 'high';
		mute.setAttribute('aria-label', v.muted ? 'Unmute' : 'Mute');
		this.#volumeSlider.set(level, `${Math.round(level * 100)}%`);
	}

	/**
	 * Fills the player when the picture's shape is within 3% of it, so renditions that are a few pixels
	 * off 16:9 (320×184, 848×480) don't leave thin bars; clearly different shapes keep their bars.
	 */
	#fit(): void {
		const v = this.#video;
		const w = this.clientWidth;
		const h = this.clientHeight;
		if (!v.videoWidth || !v.videoHeight || !w || !h) return;
		const off = Math.abs(v.videoWidth / v.videoHeight / (w / h) - 1);
		v.toggleAttribute('data-fill', off < 0.03);
	}

	#onFullscreen(): void {
		const on = this.fullscreen;
		this.#flag('fullscreen', on);
		// Phones turn sideways for a landscape video; desktops and iOS refuse, which is fine.
		const orientation = screen.orientation as ScreenOrientation & { lock?(o: string): Promise<void> };
		if (on && this.#video.videoWidth > this.#video.videoHeight) orientation?.lock?.('landscape').catch(() => {});
		else if (!on) orientation?.unlock?.();
		this.#root.querySelector('.fs')!.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen');
	}

	#syncLabel(): void {
		const title = this.getAttribute('title');
		const top = this.#root.querySelector<HTMLElement>('.top')!;
		top.querySelector('.title')!.textContent = title ?? '';
		top.toggleAttribute('data-has-title', !!title);
		if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', title ? `Video player: ${title}` : 'Video player');
		else if (this.getAttribute('aria-label')?.startsWith('Video player')) this.setAttribute('aria-label', title ? `Video player: ${title}` : 'Video player');
	}

	#fail(e: unknown): void {
		const err: PlayerError = { ...describeError(e as ShakaErrorLike, navigator.onLine), cause: e };
		this.#error = err;
		this.#flag('error', true);
		this.#flag('buffering', false);
		this.#idle.hold();
		const box = this.#root.querySelector<HTMLElement>('.error')!;
		box.inert = false;
		box.querySelector('.error-title')!.textContent = err.title;
		box.querySelector('.error-message')!.textContent = err.message;
		// Codes and the raw cause are for developers only: on the event, never on screen.
		this.dispatchEvent(new CustomEvent<PlayerError>('error', { detail: err }));
	}

	/** A plain message over the video that isn't an error, such as a live stream ending. */
	#notice(title: string, message: string): void {
		const box = this.#root.querySelector<HTMLElement>('.error')!;
		this.#flag('error', true);
		this.#flag('notice', true);
		box.inert = false;
		box.querySelector('.error-title')!.textContent = title;
		box.querySelector('.error-message')!.textContent = message;
	}

	#clearError(): void {
		this.#error = null;
		this.#flag('error', false);
		this.#flag('notice', false);
		this.#root.querySelector<HTMLElement>('.error')!.inert = true;
	}

	#flag(name: string, on: boolean): void {
		this.#ui.toggleAttribute(`data-${name}`, on);
		if (name == 'paused' || name == 'ended') {
			const label = this.#ui.hasAttribute('data-ended') ? 'Replay' : this.#ui.hasAttribute('data-paused') ? 'Play' : 'Pause';
			this.#root.querySelectorAll('.play, .big-play').forEach((b) => b.setAttribute('aria-label', label));
		}
	}

	#say(message: string): void {
		this.#sr.textContent = message;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'qyro-player': QyroPlayer;
	}
}

function esc(s: string): string {
	return s.replace(/[&<>"']/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#39' }[c]};`);
}
