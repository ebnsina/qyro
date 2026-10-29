export interface MenuItem {
	id: string;
	label: string;
	icon: string;
	/** Set for on/off items such as Loop; leaves it a plain action when undefined. */
	checked?: boolean;
	hidden?: boolean;
	run(): void;
}

const MARGIN = 8;

/** The right-click menu: a glass panel kept inside the player, driven by mouse, touch or keyboard. */
export class ContextMenu {
	#open = false;
	#returnTo: HTMLElement | null = null;

	constructor(
		private el: HTMLElement,
		private bounds: HTMLElement,
		private items: () => MenuItem[],
		private footer: string,
		private onToggle: (open: boolean) => void,
	) {
		el.addEventListener('click', (e) => {
			const button = (e.target as Element).closest<HTMLElement>('[data-id]');
			if (!button) return;
			const item = this.items().find((i) => i.id == button.dataset.id);
			this.close(true);
			item?.run();
		});
		el.addEventListener('keydown', this.#key);
		// Any press outside the menu, in the player or anywhere on the page, closes it.
		const outside = (e: Event) => this.#open && !e.composedPath().includes(el) && (this.close(), true);
		// Inside the player, the press that closes the menu does nothing else (no play toggle).
		bounds.addEventListener('pointerdown', (e) => outside(e) && e.stopPropagation(), true);
		document.addEventListener('pointerdown', (e) => !e.composedPath().includes(bounds) && outside(e), true);
	}

	get isOpen(): boolean {
		return this.#open;
	}

	/** Opens with its corner at (x, y) in viewport pixels, or centered when no point is given. */
	open(x?: number, y?: number): void {
		const root = this.bounds.getRootNode() as ShadowRoot;
		this.#returnTo = (root.activeElement as HTMLElement | null) ?? (root.host as HTMLElement);
		this.#render();
		const box = this.bounds.getBoundingClientRect();
		const w = this.el.offsetWidth;
		const h = Math.min(this.el.offsetHeight, box.height - 2 * MARGIN);
		const left = x === undefined ? (box.width - w) / 2 : Math.min(Math.max(x - box.left, MARGIN), box.width - w - MARGIN);
		const top = y === undefined ? (box.height - h) / 2 : Math.min(Math.max(y - box.top, MARGIN), box.height - h - MARGIN);
		Object.assign(this.el.style, { left: `${Math.max(MARGIN, left)}px`, top: `${Math.max(MARGIN, top)}px`, maxHeight: `${box.height - 2 * MARGIN}px` });
		// Grow from the corner nearest the pointer.
		const ox = x !== undefined && x - box.left > left + w / 2 ? 'right' : 'left';
		const oy = y !== undefined && y - box.top > top + h / 2 ? 'bottom' : 'top';
		this.el.style.transformOrigin = x === undefined ? 'center' : `${oy} ${ox}`;
		this.el.inert = false;
		this.#open = true;
		this.onToggle(true);
		this.el.querySelector<HTMLElement>('[data-id]')?.focus();
	}

	close(returnFocus = false): void {
		if (!this.#open) return;
		this.#open = false;
		this.el.inert = true;
		this.onToggle(false);
		if (returnFocus) this.#returnTo?.focus?.();
	}

	#render(): void {
		this.el.innerHTML =
			this.items()
				.filter((i) => !i.hidden)
				.map((i) => {
					const role = i.checked === undefined ? 'menuitem' : `menuitemcheckbox" aria-checked="${i.checked}`;
					return `<button class="item" role="${role}" data-id="${i.id}">${i.icon}<span class="label">${i.label}</span>${i.checked ? '<span class="on" aria-hidden="true"></span>' : ''}</button>`;
				})
				.join('') + `<div class="menu-foot" role="none">${this.footer}</div>`;
	}

	#key = (e: KeyboardEvent) => {
		const items = [...this.el.querySelectorAll<HTMLElement>('[data-id]')];
		const i = items.indexOf(e.composedPath()[0] as HTMLElement);
		const go = (n: number) => items[(n + items.length) % items.length]?.focus();
		const keys: Record<string, () => void> = {
			ArrowDown: () => go(i + 1),
			ArrowUp: () => go(i - 1),
			Home: () => go(0),
			End: () => go(-1),
			Escape: () => this.close(true),
			Tab: () => this.close(true),
		};
		const fn = keys[e.key];
		e.stopPropagation();
		if (!fn) return;
		e.preventDefault();
		fn();
	};
}
