import type { Option } from '../engine/tracks.js';
import { icons } from './icons.js';

/** One row of the settings sheet and the choices behind it. */
export interface Menu {
	id: string;
	label: string;
	options(): Option<number>[];
	/** What the row shows on the main page, e.g. "Auto (720p)". */
	value(): string;
	select(value: number): void;
	/** Rows under the choices that open their own page, e.g. Captions → Caption style. */
	more?(): Menu[];
}

const hasChoice = (m: Menu) => m.options().length > 1 || !!m.more?.().length;

/** The settings sheet: a main page of menus, each opening a page of choices that slides in, and deeper. */
export class Settings {
	#open = false;
	/** The pages opened from the main page, deepest last. */
	#stack: Menu[] = [];
	#main: HTMLElement;
	#sub: HTMLElement;

	constructor(
		private sheet: HTMLElement,
		private button: HTMLElement,
		private menus: () => Menu[],
		private onToggle: (open: boolean) => void,
	) {
		const pages = sheet.querySelector('.pages')!;
		this.#main = page('main');
		this.#sub = page('sub');
		this.#sub.dataset.state = 'right';
		pages.append(this.#main, this.#sub);
		sheet.addEventListener('keydown', this.#key);
		sheet.addEventListener('click', this.#click);
	}

	get isOpen(): boolean {
		return this.#open;
	}

	/** Menus with a real choice to make; a stream with one audio track shows no audio row. */
	visible(): Menu[] {
		return this.menus().filter(hasChoice);
	}

	toggle(): void {
		if (this.#open) this.close();
		else this.open();
	}

	open(): void {
		if (!this.visible().length) return;
		this.#open = true;
		this.#stack = [];
		this.render();
		this.sheet.inert = false;
		this.button.setAttribute('aria-expanded', 'true');
		this.onToggle(true);
		this.#focusFirst(this.#main);
	}

	close(returnFocus = false): void {
		if (!this.#open) return;
		this.#open = false;
		this.sheet.inert = true;
		this.button.setAttribute('aria-expanded', 'false');
		this.onToggle(false);
		if (returnFocus) this.button.focus();
	}

	/** Redraws the open pages, e.g. after the quality changes on its own. */
	render(): void {
		if (!this.#open) return;
		// Re-rendering replaces the buttons, so put focus back on the same one afterwards.
		const focused = (this.sheet.getRootNode() as ShadowRoot).activeElement as HTMLElement | null;
		const key = focused && this.sheet.contains(focused) ? focusKey(focused) : null;
		this.#draw();
		if (key) this.sheet.querySelector<HTMLElement>(key)?.focus();
	}

	#draw(): void {
		const pages = this.#main.parentElement!;
		const from = pages.offsetHeight;
		this.#drawPages();
		// The sheet fits the page on show and eases between heights; CSS can't animate to an auto height.
		pages.style.height = '';
		const to = pages.offsetHeight;
		if (!from || from == to || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		pages.style.height = `${from}px`;
		void pages.offsetHeight;
		pages.style.height = `${to}px`;
		const done = (e: TransitionEvent) => {
			if (e.target != pages || e.propertyName != 'height') return;
			pages.style.height = '';
			pages.removeEventListener('transitionend', done);
		};
		pages.addEventListener('transitionend', done);
	}

	#drawPages(): void {
		this.#main.innerHTML = this.visible().map(row).join('');
		const m = this.#stack.at(-1);
		this.#main.dataset.state = m ? 'left' : '';
		this.#sub.dataset.state = m ? '' : 'right';
		this.#main.inert = !!m;
		this.#sub.inert = !m;
		if (!m) return;
		const parent = this.#stack.at(-2);
		this.#sub.setAttribute('aria-label', m.label);
		this.#sub.innerHTML =
			`<button class="item head" role="menuitem" data-back aria-label="Back to ${parent ? esc(parent.label) : 'settings'}">${icons.back}<span>${m.label}</span></button>` +
			m
				.options()
				.map(
					(o) =>
						`<button class="item" role="menuitemradio" aria-checked="${o.active}" data-value="${o.value}"><span class="check">${icons.check}</span><span class="label">${esc(o.label)}</span>${o.badge ? `<span class="badge">${esc(o.badge)}</span>` : ''}</button>`,
				)
				.join('') +
			(m.more?.() ?? []).filter(hasChoice).map(row).join('');
	}

	/** Opens a page one level deeper. */
	#push(menu: Menu): void {
		this.#stack.push(menu);
		this.#slide();
		this.render();
		this.#focusFirst(this.#sub, '[aria-checked="true"]');
	}

	/** Goes back one level, focusing the row that opened the page. */
	#pop(): void {
		const from = this.#stack.pop();
		if (this.#stack.length) this.#slide();
		this.render();
		const page = this.#stack.length ? this.#sub : this.#main;
		page.querySelector<HTMLElement>(`[data-menu="${from?.id}"]`)?.focus();
	}

	// Replays the slide when one sub page replaces another.
	#slide(): void {
		if (this.#stack.length < 2 && this.#sub.dataset.state != '') return;
		this.#sub.dataset.state = 'right';
		void this.#sub.offsetWidth;
	}

	#find(id: string): Menu | undefined {
		const top = this.#stack.at(-1);
		return (top ? (top.more?.() ?? []) : this.visible()).find((m) => m.id == id);
	}

	#click = (e: Event) => {
		const item = (e.target as Element).closest<HTMLElement>('.item');
		if (!item) return;
		if (item.dataset.menu) {
			const m = this.#find(item.dataset.menu);
			return m && this.#push(m);
		}
		if ('back' in item.dataset) return this.#pop();
		const top = this.#stack.at(-1);
		if (item.dataset.value !== undefined && top) {
			top.select(Number(item.dataset.value));
			this.#pop();
		}
	};

	#key = (e: KeyboardEvent) => {
		const deep = this.#stack.length > 0;
		const page = deep ? this.#sub : this.#main;
		const items = [...page.querySelectorAll<HTMLElement>('.item')];
		const i = items.indexOf(e.composedPath()[0] as HTMLElement);
		const go = (n: number) => items[(n + items.length) % items.length]?.focus();
		switch (e.key) {
			case 'ArrowDown':
				go(i + 1);
				break;
			case 'ArrowUp':
				go(i - 1);
				break;
			case 'Home':
				go(0);
				break;
			case 'End':
				go(-1);
				break;
			case 'ArrowLeft':
				if (deep) this.#pop();
				break;
			case 'ArrowRight':
				if (items[i]?.dataset.menu) items[i].click();
				break;
			case 'Escape':
				if (deep) this.#pop();
				else this.close(true);
				break;
			case 'Tab':
				this.close();
				return;
			default:
				// Space and Enter work through the button's own click.
				if (e.key == ' ' || e.key == 'Enter') e.stopPropagation();
				return;
		}
		e.preventDefault();
		e.stopPropagation();
	};

	#focusFirst(page: HTMLElement, selector = '.item'): void {
		(page.querySelector<HTMLElement>(selector) ?? page.querySelector<HTMLElement>('.item'))?.focus();
	}
}

function row(m: Menu): string {
	return `<button class="item" role="menuitem" aria-haspopup="menu" data-menu="${m.id}"><span class="label">${m.label}</span><span class="value">${esc(m.value())}</span>${icons.next}</button>`;
}

function focusKey(el: HTMLElement): string | null {
	const page = el.closest('.page')?.classList.contains('main') ? '.main' : '.sub';
	if (el.dataset.menu) return `${page} [data-menu="${el.dataset.menu}"]`;
	if (el.dataset.value !== undefined) return `${page} [data-value="${el.dataset.value}"]`;
	if ('back' in el.dataset) return `${page} [data-back]`;
	return null;
}

function page(name: string): HTMLElement {
	const el = document.createElement('div');
	el.className = `page ${name}`;
	el.setAttribute('role', 'menu');
	if (name == 'main') el.setAttribute('aria-label', 'Settings');
	return el;
}

function esc(s: string): string {
	return s.replace(/[&<>"]/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[c]};`);
}
