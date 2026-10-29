import { speakTime } from './time.js';
import type { Thumb } from './storyboard.js';
import { capture, fractionAt } from './slider.js';

export interface Range {
	start: number;
	end: number;
}

interface Hooks {
	range(): Range;
	/** Label for a time on the bar, e.g. "-0:32" behind live. */
	label(t: number): string;
	seek(t: number): void;
	dragging(on: boolean): void;
	/** The storyboard image for a time, if the video has any. */
	thumb(t: number): Thumb | null;
}

const images = new Map<string, HTMLImageElement>();

/** Loads each storyboard image once; resolves at once when it's already decoded. */
function image(url: string): HTMLImageElement {
	let img = images.get(url);
	if (!img) {
		img = new Image();
		img.decoding = 'async';
		img.src = url;
		images.set(url, img);
	}
	return img;
}

/** The seek bar: progress, buffered range, hover preview and pointer dragging. */
export class Scrubber {
	#dragging = false;
	#bubble: HTMLElement;
	#time: HTMLElement;
	#shot: HTMLElement;
	#shown: Thumb | null = null;

	constructor(
		private el: HTMLElement,
		private hooks: Hooks,
	) {
		this.#bubble = el.querySelector('.bubble')!;
		this.#time = el.querySelector('.bubble-time')!;
		this.#shot = el.querySelector('.shot')!;
		el.addEventListener('pointerdown', this.#down);
		el.addEventListener('pointermove', this.#move);
		el.addEventListener('pointerup', this.#up);
		el.addEventListener('pointercancel', this.#cancel);
		el.addEventListener('pointerleave', () => this.#dragging || el.removeAttribute('data-hovering'));
	}

	get dragging(): boolean {
		return this.#dragging;
	}

	/** Paints the bar for time `t` with media buffered up to `buffered`. */
	update(t: number, buffered: number): void {
		const r = this.hooks.range();
		const span = r.end - r.start;
		if (!this.#dragging) this.#set('--progress', span > 0 ? (t - r.start) / span : 0);
		this.#set('--buffered', span > 0 ? (buffered - r.start) / span : 0);
		this.el.setAttribute('aria-valuemin', String(Math.floor(r.start)));
		this.el.setAttribute('aria-valuemax', String(Math.floor(r.end)));
		this.el.setAttribute('aria-valuenow', String(Math.floor(t)));
		this.el.setAttribute('aria-valuetext', `${speakTime(t - r.start)} of ${speakTime(span)}`);
	}

	#set(name: string, f: number): void {
		this.el.style.setProperty(name, String(Math.min(1, Math.max(0, f))));
	}

	#fraction(e: PointerEvent): number {
		return fractionAt(this.el, e);
	}

	#timeAt(f: number): number {
		const r = this.hooks.range();
		return r.start + f * (r.end - r.start);
	}

	/** Shows the time under the pointer, keeping the bubble inside the bar at both ends. */
	#preview(f: number): void {
		const t = this.#timeAt(f);
		this.#time.textContent = this.hooks.label(t);
		this.#paintShot(this.hooks.thumb(t));
		const width = this.el.clientWidth;
		const half = this.#bubble.offsetWidth / 2;
		this.el.style.setProperty('--hover-x', `${f * width}px`);
		this.el.style.setProperty('--bubble-x', `${Math.min(Math.max(f * width, half), width - half)}px`);
	}

	/** Draws the storyboard tile, keeping the last one up until the next image has loaded. */
	#paintShot(th: Thumb | null): void {
		this.#bubble.toggleAttribute('data-shot', !!th);
		if (!th || th == this.#shown) return;
		const img = image(th.url);
		if (!img.complete || !img.naturalWidth) {
			img.addEventListener('load', () => this.#bubble.hasAttribute('data-shot') && this.#paintShot(th), { once: true });
			return;
		}
		this.#shown = th;
		// 160px with a mouse, 120px on phones and small players.
		const w = matchMedia('(pointer: coarse)').matches || this.el.clientWidth < 400 ? 120 : 160;
		const tileW = th.w || img.naturalWidth;
		const tileH = th.h || img.naturalHeight;
		const scale = w / tileW;
		Object.assign(this.#shot.style, {
			width: `${w}px`,
			height: `${Math.round(tileH * scale)}px`,
			backgroundImage: `url("${th.url}")`,
			backgroundSize: `${img.naturalWidth * scale}px ${img.naturalHeight * scale}px`,
			backgroundPosition: `${-th.x * scale}px ${-th.y * scale}px`,
		});
	}

	/** Starts loading the images for a storyboard before anyone hovers. */
	static preload(list: Thumb[]): void {
		for (const url of new Set(list.map((t) => t.url))) image(url);
	}

	#down = (e: PointerEvent) => {
		if (e.button != 0) return;
		capture(this.el, e);
		this.#dragging = true;
		this.el.setAttribute('data-dragging', '');
		this.hooks.dragging(true);
		this.#drag(e);
	};

	#move = (e: PointerEvent) => {
		const f = this.#fraction(e);
		if (e.pointerType == 'mouse') this.el.setAttribute('data-hovering', '');
		this.#preview(f);
		if (this.#dragging) this.#drag(e);
	};

	#drag(e: PointerEvent): void {
		const f = this.#fraction(e);
		this.#set('--progress', f);
		this.#preview(f);
	}

	#up = (e: PointerEvent) => {
		if (!this.#dragging) return;
		this.hooks.seek(this.#timeAt(this.#fraction(e)));
		this.#end();
	};

	#cancel = () => this.#dragging && this.#end();

	#end(): void {
		this.#dragging = false;
		this.el.removeAttribute('data-dragging');
		this.hooks.dragging(false);
	}
}
