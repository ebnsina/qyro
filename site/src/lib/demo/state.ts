// The playground's state: which template, which video, which attributes and which theme. It is the
// one thing the preview, the controls, the code panel and the URL all read.
import { media } from '#lib/site/media.js';

export interface Source {
	id: string;
	label: string;
	src: string;
	title: string;
	poster?: string;
	/** Only Big Buck Bunny's streams have a storyboard made for them. */
	storyboard?: string;
	/** A WebVTT chapters file, shown by the Course template. */
	chapters?: string;
	live?: boolean;
	/** The picture's shape, given up front so the player is the right size before the video loads. */
	aspect?: string;
}

export const sources: Source[] = [
	{ id: 'bbb-hls', label: 'Big Buck Bunny (HLS)', src: media.bbb.hls, title: media.bbb.title, poster: media.bbb.poster, storyboard: media.bbb.storyboard, chapters: media.bbb.chapters },
	{ id: 'bbb-dash', label: 'Big Buck Bunny (DASH)', src: media.bbb.dash, title: media.bbb.title, poster: media.bbb.poster, storyboard: media.bbb.storyboard, chapters: media.bbb.chapters },
	{ id: 'bbb-mp4', label: 'Big Buck Bunny clip (MP4)', src: '/media/bbb/clip.mp4', title: 'Big Buck Bunny clip', poster: media.bbb.poster },
	{ id: 'sintel', label: 'Sintel (HLS)', src: media.sintel.hls, title: media.sintel.title, poster: media.sintel.poster, aspect: '2.35' },
	{ id: 'tos', label: 'Tears of Steel (HLS)', src: media.tos.hls, title: media.tos.title, poster: media.tos.poster, aspect: '2.4' },
	{ id: 'live', label: 'Live test stream (DASH)', src: media.live.dash, title: 'Opening keynote', live: true },
	{ id: 'custom', label: 'Your own URL', src: '', title: 'My video' },
];

export const CAPTIONS = '/media/captions.en.vtt';

export interface Theme {
	accent: string;
	tint: string;
	tintAlpha: number;
	blur: number;
	radius: number;
	glass: 'dark' | 'light';
	/** The glass tint takes the accent's colour, so the controls and the accent read as one. */
	matchTint: boolean;
}

export const DEFAULT_THEME: Theme = { accent: '#ffffff', tint: '#1c1c20', tintAlpha: 36, blur: 18, radius: 16, glass: 'dark', matchTint: false };

/** The tint colour in effect: the accent when the tint follows it. */
export const tintOf = (t: Theme) => (t.matchTint ? t.accent : t.tint);

export interface Settings {
	source: string;
	url: string;
	autoplay: boolean;
	muted: boolean;
	loop: boolean;
	poster: boolean;
	captions: boolean;
	thumbnails: boolean;
	start: number;
	live: boolean;
}

export interface State extends Settings {
	t: string;
	theme: Theme;
}

const BASE: Settings = { source: 'bbb-hls', url: '', autoplay: false, muted: false, loop: false, poster: true, captions: false, thumbnails: true, start: 0, live: false };

/** What each template starts with; the controls and the URL change it from there. */
export const TEMPLATE_DEFAULTS: Record<string, Partial<Settings>> = {
	standard: {},
	cinema: { source: 'sintel', poster: false },
	hero: { source: 'tos', autoplay: true, muted: true, loop: true, start: 60 },
	course: { captions: true },
	article: { source: 'sintel', start: 20 },
	product: { muted: true, loop: true, start: 95 },
	live: { source: 'live', autoplay: true, muted: true, thumbnails: false },
	vertical: { start: 95, loop: true },
	playlist: {},
};

export const settingsFor = (t: string): Settings => ({ ...BASE, ...(TEMPLATE_DEFAULTS[t] ?? {}) });

export function initial(t = 'standard'): State {
	return { t, ...settingsFor(t), theme: { ...DEFAULT_THEME } };
}

const BOOLS = ['autoplay', 'muted', 'loop', 'poster', 'captions', 'thumbnails', 'live'] as const;
const THEME_KEYS: Record<keyof Theme, string> = { accent: 'accent', tint: 'tint', tintAlpha: 'tint-alpha', blur: 'blur', radius: 'radius', glass: 'glass', matchTint: 'match-tint' };

/** Reads a state from `?t=course&src=…&captions=1`; anything missing comes from the template. */
export function parse(search: string, templates: string[]): State {
	const q = new URLSearchParams(search);
	const t = templates.includes(q.get('t') ?? '') ? q.get('t')! : 'standard';
	const s = initial(t);
	const src = q.get('src');
	if (src) {
		const known = sources.find((x) => x.id == src);
		if (known) s.source = known.id;
		else {
			s.source = 'custom';
			s.url = src;
		}
	}
	for (const b of BOOLS) if (q.has(b)) s[b] = q.get(b) == '1';
	const start = Number(q.get('start'));
	if (Number.isFinite(start) && start >= 0 && q.has('start')) s.start = start;
	for (const [k, name] of Object.entries(THEME_KEYS) as [keyof Theme, string][]) {
		const v = q.get(name);
		if (v === null) continue;
		if (k == 'accent' || k == 'tint') {
			if (/^#[0-9a-f]{6}$/i.test(v)) s.theme[k] = v.toLowerCase();
		} else if (k == 'glass') s.theme.glass = v == 'light' ? 'light' : 'dark';
		else if (k == 'matchTint') s.theme.matchTint = v == '1';
		else if (Number.isFinite(Number(v))) s.theme[k] = Number(v);
	}
	return s;
}

/** Writes only what differs from the template's defaults, so links stay short. */
export function serialize(s: State): string {
	const d = initial(s.t);
	const q = new URLSearchParams({ t: s.t });
	if (s.source != d.source || s.source == 'custom') q.set('src', s.source == 'custom' ? s.url : s.source);
	for (const b of BOOLS) if (s[b] != d[b]) q.set(b, s[b] ? '1' : '0');
	if (s.start != d.start) q.set('start', String(s.start));
	for (const [k, name] of Object.entries(THEME_KEYS) as [keyof Theme, string][]) {
		if (s.theme[k] == d.theme[k]) continue;
		const v = s.theme[k];
		q.set(name, typeof v == 'boolean' ? (v ? '1' : '0') : String(v));
	}
	return `?${q}`;
}

export const sourceOf = (s: State) => sources.find((x) => x.id == s.source) ?? sources[0];

/** The chapters track for this state: the Course template, on a video that has chapters. */
export const chaptersOf = (s: State) => (s.t == 'course' ? sourceOf(s).chapters : undefined);

/** The attributes on <qyro-player> for this state; `asset` makes site paths absolute for the page. */
export function playerAttrs(s: State, asset: (p: string) => string = (p) => p): Record<string, string | true> {
	const src = sourceOf(s);
	const a: Record<string, string | true> = {};
	a.src = s.source == 'custom' ? s.url : src.src.startsWith('/') ? asset(src.src) : src.src;
	a.title = src.title;
	if (s.poster && src.poster) a.poster = src.poster;
	if (s.thumbnails && src.storyboard) a.thumbnails = asset(src.storyboard);
	if (s.start > 0) a.start = String(s.start);
	for (const b of ['autoplay', 'muted', 'loop', 'live'] as const) if (s[b]) a[b] = true;
	if (s.theme.glass == 'light') a.glass = 'light';
	if (src.aspect && s.source != 'custom') a.style = `--qyro-aspect-ratio: ${src.aspect}`;
	return a;
}

const hexToRgb = (hex: string) => {
	const n = parseInt(hex.slice(1), 16);
	return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** The theme's custom properties that differ from Qyro's defaults. */
export function themeVars(t: Theme): Record<string, string> {
	const d = DEFAULT_THEME;
	const v: Record<string, string> = {};
	if (t.accent != d.accent) v['--qyro-accent'] = t.accent;
	if (tintOf(t) != tintOf(d) || t.tintAlpha != d.tintAlpha) v['--qyro-glass-tint'] = `rgb(${hexToRgb(tintOf(t))} / ${t.tintAlpha / 100})`;
	if (t.blur != d.blur) v['--qyro-glass-blur'] = `${t.blur}px`;
	if (t.radius != d.radius) v['--qyro-radius'] = `${t.radius}px`;
	return v;
}

export const styleOf = (vars: Record<string, string>) =>
	Object.entries(vars)
		.map(([k, v]) => `${k}: ${v}`)
		.join('; ');
