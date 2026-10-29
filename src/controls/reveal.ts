/**
 * Keeps a popover zone (a button plus its panel) open while the mouse is anywhere over it,
 * while a drag that started inside is still going (even outside the player), or while it has
 * keyboard focus. Closes `delay` ms after all of those end, so a short slip doesn't snap it shut.
 */
export class Reveal {
	#hover = false;
	#dragging = false;
	#closeTimer: ReturnType<typeof setTimeout> | undefined;

	constructor(
		private zone: HTMLElement,
		private onChange: (open: boolean) => void = () => {},
		private delay = 300,
	) {
		zone.addEventListener('pointerenter', (e) => e.pointerType != 'touch' && this.#set('hover', true));
		zone.addEventListener('pointerleave', (e) => e.pointerType != 'touch' && this.#set('hover', false));
		zone.addEventListener('focusin', () => this.#update());
		zone.addEventListener('focusout', () => queueMicrotask(() => this.#update()));
		zone.addEventListener('pointerdown', (e) => {
			if (!(e.target as Element).closest?.('.slider')) return;
			this.#set('dragging', true);
			const end = () => {
				window.removeEventListener('pointerup', end);
				window.removeEventListener('pointercancel', end);
				this.#set('dragging', false);
			};
			window.addEventListener('pointerup', end);
			window.addEventListener('pointercancel', end);
		});
	}

	get open(): boolean {
		return this.zone.hasAttribute('data-open');
	}

	get dragging(): boolean {
		return this.#dragging;
	}

	#set(what: 'hover' | 'dragging', on: boolean): void {
		if (what == 'hover') this.#hover = on;
		else this.#dragging = on;
		this.#update();
	}

	#update(): void {
		const keep = this.#hover || this.#dragging || !!this.zone.querySelector(':focus-visible');
		clearTimeout(this.#closeTimer);
		if (keep) return this.#toggle(true);
		this.#closeTimer = setTimeout(() => this.#toggle(false), this.delay);
	}

	#toggle(open: boolean): void {
		if (open == this.open) return;
		this.zone.toggleAttribute('data-open', open);
		this.onChange(open);
	}
}
