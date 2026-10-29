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
}

/** The settings sheet: a main page of menus, each opening a page of choices that slides in. */
export class Settings {
	#open = false;
	#menu: Menu | null = null;
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
		return this.menus().filter((m) => m.options().length > 1);
	}

	toggle(): void {
		if (this.#open) this.close();
		else this.open();
	}

	open(): void {
		if (!this.visible().length) return;
		this.#open = true;
		this.#menu = null;
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
		this.#main.innerHTML = this.visible()
			.map(
				(m) =>
					`<button class="item" role="menuitem" aria-haspopup="menu" data-menu="${m.id}"><span class="label">${m.label}</span><span class="value">${esc(m.value())}</span>${icons.next}</button>`,
			)
			.join('');
		this.#main.dataset.state = this.#menu ? 'left' : '';
		this.#sub.dataset.state = this.#menu ? '' : 'right';
		this.#main.inert = !!this.#menu;
		this.#sub.inert = !this.#menu;
		if (!this.#menu) return;
		const m = this.#menu;
		this.#sub.setAttribute('aria-label', m.label);
		this.#sub.innerHTML =
			`<button class="item head" role="menuitem" data-back aria-label="Back to settings">${icons.back}<span>${m.label}</span></button>` +
			m
				.options()
				.map(
					(o) =>
						`<button class="item" role="menuitemradio" aria-checked="${o.active}" data-value="${o.value}"><span class="check">${icons.check}</span><span class="label">${esc(o.label)}</span>${o.badge ? `<span class="badge">${esc(o.badge)}</span>` : ''}</button>`,
				)
				.join('');
	}

	#show(menu: Menu | null): void {
		const from = this.#menu?.id;
		this.#menu = menu;
		this.render();
		if (menu) this.#focusFirst(this.#sub, '[aria-checked="true"]');
		else this.#main.querySelector<HTMLElement>(`[data-menu="${from}"]`)?.focus();
	}

	#click = (e: Event) => {
		const item = (e.target as Element).closest<HTMLElement>('.item');
		if (!item) return;
		if (item.dataset.menu) return this.#show(this.visible().find((m) => m.id == item.dataset.menu) ?? null);
		if ('back' in item.dataset) return this.#show(null);
		if (item.dataset.value !== undefined && this.#menu) {
			this.#menu.select(Number(item.dataset.value));
			this.#show(null);
		}
	};

	#key = (e: KeyboardEvent) => {
		const page = this.#menu ? this.#sub : this.#main;
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
				if (this.#menu) this.#show(null);
				break;
			case 'ArrowRight':
				if (!this.#menu) items[i]?.click();
				break;
			case 'Escape':
				if (this.#menu) this.#show(null);
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
