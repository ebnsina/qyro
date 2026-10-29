<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getTabs } from './context';

	interface Props extends Omit<HTMLButtonAttributes, 'value'> {
		value: string;
		children: Snippet;
	}

	let { value, children, class: className, ...rest }: Props = $props();
	const tabs = getTabs();
	// Unset value: the first enabled tab claims it during render, so server HTML already shows its panel.
	untrack(() => {
		if (tabs.value === undefined && !rest.disabled) tabs.select(value);
	});
	const ids = $derived(tabs.ids(value));
	const selected = $derived(tabs.value === value);
</script>

<!-- Roving tabindex: only the selected tab is in the Tab order; arrows move between the rest. -->
<button
	type="button"
	role="tab"
	id={ids.tab}
	aria-controls={ids.panel}
	aria-selected={selected}
	tabindex={selected ? 0 : -1}
	class={['tab', className]}
	{...rest}
	onclick={(e) => {
		tabs.select(value);
		rest.onclick?.(e);
	}}
>
	{@render children()}
</button>

<style>
	.tab {
		box-sizing: border-box;
		position: relative;
		flex: none;
		min-block-size: var(--ui-control-h);
		padding: 0.25rem 0.625rem;
		/* Invisible normally; outlines the tab in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius-control) + 0.125rem);
		background: transparent;
		color: var(--ui-muted);
		font: inherit;
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.005em;
		text-align: start;
		white-space: nowrap;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: color var(--ui-dur-press) ease;
	}
	/* Line tabs: 30px with a mouse; the chosen one is outlined above the underline. */
	@media (pointer: fine) {
		:global(.tabs:not(.folder, .pill)) .tab {
			min-block-size: 1.875rem;
		}
	}
	@media (pointer: coarse) {
		.tab {
			min-block-size: var(--ui-control-h-touch);
		}
	}
	@media (hover: hover) and (pointer: fine) {
		.tab:hover:not(:disabled, [aria-selected='true']) {
			color: var(--ui-fg);
		}
	}
	.tab:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		/* Inset: the tab strip scrolls on narrow screens, and a scroll container clips outer rings. */
		outline-offset: calc(-1 * var(--ui-ring-width));
	}
	.tab[aria-selected='true'] {
		color: var(--ui-accent);
	}
	:global(.tabs:not(.folder, .pill)) .tab[aria-selected='true'] {
		border-color: var(--ui-field-line);
	}
	:global(.tabs.folder) .tab[aria-selected='true'] {
		color: var(--ui-fg);
	}
	:global(.tabs.pill) .tab {
		border-radius: var(--ui-radius-control);
	}
	:global(.tabs.pill) .tab[aria-selected='true'] {
		color: var(--ui-fg);
	}
	.tab:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	/* Before hydration the sliding bar isn't measured yet: the tab draws the same bar itself, so
	   the hand-over is invisible (an inset shadow would curve with the tab's corners). */
	:global(.tabs:not(.folder, .pill) [role='tablist']:not([data-ready]))
		> .tab[aria-selected='true']::after {
		content: '';
		position: absolute;
		inset: auto -1px calc(-1px - var(--tab-gap, 0px));
		block-size: 1.5px;
		background: var(--ui-accent);
	}
	/* Folder, before hydration: the tab draws its own fill until the sliding shape is measured. */
	:global(.tabs.folder [role='tablist']:not([data-ready])) > .tab[aria-selected='true'] {
		border-end-start-radius: 0;
		border-end-end-radius: 0;
		background: var(--ui-subtle);
	}
	:global(.tabs.pill [role='tablist']:not([data-ready])) > .tab[aria-selected='true'] {
		background: light-dark(var(--ui-surface), color-mix(in oklab, var(--ui-fg) 12%, var(--ui-bg)));
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
	}
	:global([role='tablist'][aria-orientation='vertical']:not([data-ready]))
		> .tab[aria-selected='true']::after {
		inset-block: -1px;
		inset-inline: auto calc(-1px - var(--tab-gap, 0px));
		inline-size: 1.5px;
		block-size: auto;
	}
</style>
