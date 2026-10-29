import type { HTMLAttributes } from 'svelte/elements';

declare global {
	namespace App {}
}

declare module 'svelte/elements' {
	interface SvelteHTMLElements {
		'qyro-player': HTMLAttributes<HTMLElement> & Record<string, unknown>;
	}
}

export {};
