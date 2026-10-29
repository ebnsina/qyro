/** Shared by the seek bar and the volume slider, so the two behave alike. */

/** Where along `el` the pointer is, from 0 to 1. */
export function fractionAt(el: HTMLElement, e: PointerEvent): number {
	const box = el.getBoundingClientRect();
	return box.width ? Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)) : 0;
}

/** Keeps the drag going when the pointer leaves the slider, or even the window. */
export function capture(el: HTMLElement, e: PointerEvent): void {
	try {
		el.setPointerCapture(e.pointerId);
	} catch {
		// A pointer the browser has already let go of can't be captured; the drag still works inside.
	}
}

interface Hooks {
	change(f: number): void;
	dragging(on: boolean): void;
}

/** The volume slider: the seek bar's track and glass bead, with keyboard steps of 5%. */
export class Slider {
	#dragging = false;

	constructor(
		private el: HTMLElement,
		private hooks: Hooks,
	) {
		el.addEventListener('pointerdown', (e) => {
			if (e.button != 0) return;
			capture(el, e);
			this.#drag(true);
			hooks.change(fractionAt(el, e));
		});
		el.addEventListener('pointermove', (e) => this.#dragging && hooks.change(fractionAt(el, e)));
		el.addEventListener('pointerup', () => this.#drag(false));
		el.addEventListener('pointercancel', () => this.#drag(false));
		el.addEventListener('keydown', (e) => {
			const now = Number(el.getAttribute('aria-valuenow')) / 100;
			const next = { ArrowRight: now + 0.05, ArrowUp: now + 0.05, ArrowLeft: now - 0.05, ArrowDown: now - 0.05, Home: 0, End: 1, PageUp: now + 0.2, PageDown: now - 0.2 }[e.key];
			if (next === undefined) return;
			e.preventDefault();
			e.stopPropagation();
			hooks.change(Math.min(1, Math.max(0, Math.round(next * 100) / 100)));
		});
	}

	get dragging(): boolean {
		return this.#dragging;
	}

	/** Paints the level, 0 to 1. */
	set(f: number, text: string): void {
		this.el.style.setProperty('--progress', String(f));
		this.el.setAttribute('aria-valuenow', String(Math.round(f * 100)));
		this.el.setAttribute('aria-valuetext', text);
	}

	#drag(on: boolean): void {
		if (on == this.#dragging) return;
		this.#dragging = on;
		this.el.toggleAttribute('data-dragging', on);
		this.hooks.dragging(on);
	}
}
