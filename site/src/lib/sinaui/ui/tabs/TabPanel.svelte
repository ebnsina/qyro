<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTabs } from './context';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		children: Snippet;
	}

	let { value, children, class: className, ...rest }: Props = $props();
	const tabs = getTabs();
	const ids = $derived(tabs.ids(value));

	// A panel is a Tab stop only when nothing inside can take focus (React Aria's useTabPanel):
	// otherwise Tab goes straight to its first control, not to the panel and then the control.
	const focusable =
		'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable]';
	let empty = $state(true);
	const watch = (el: HTMLElement) => {
		const check = () => (empty = !el.querySelector(focusable));
		const mo = new MutationObserver(check);
		mo.observe(el, { childList: true, subtree: true });
		check();
		return () => mo.disconnect();
	};
</script>

<!-- Hidden, not unmounted: aria-controls must always point at an element that exists, and panel state survives switching. -->
<div
	role="tabpanel"
	id={ids.panel}
	aria-labelledby={ids.tab}
	tabindex={empty ? 0 : undefined}
	{@attach watch}
	hidden={tabs.value !== value}
	class={['panel', className]}
	{...rest}
>
	{@render children()}
</div>

<style>
	.panel {
		grid-area: 2 / 1;
		min-inline-size: 0;
		border-radius: var(--ui-radius);
	}
	/* Stacked under the chosen one, not removed, so the area doesn't resize. Invisible is also
	   out of the accessibility tree and the Tab order, like hidden. */
	.panel[hidden] {
		display: block;
		visibility: hidden;
	}
	:global(.tabs[data-orientation='vertical']) > .panel {
		grid-area: 1 / 2;
	}
	/* Beside a vertical list: the first line centers on the first tab (the control height). */
	:global(.tabs[data-orientation='vertical']) > .panel {
		padding-block-start: calc((var(--ui-control-h) - 1lh) / 2);
	}
	@media (pointer: coarse) {
		:global(.tabs[data-orientation='vertical']) > .panel {
			padding-block-start: calc((var(--ui-control-h-touch) - 1lh) / 2);
		}
	}
	/* Folder: the panel shares the chosen tab's fill, so the two read as one sheet. */
	:global(.tabs.folder) > .panel {
		padding: 1rem;
		background: var(--ui-subtle);
	}
	.panel:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
</style>
