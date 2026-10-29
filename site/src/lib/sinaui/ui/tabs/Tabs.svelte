<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTabs } from './context';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** Selected tab. Left unset, the first enabled tab is selected. */
		value?: string;
		orientation?: 'horizontal' | 'vertical';
		/** automatic: arrow keys select. manual: arrow keys move focus, Enter/Space select. */
		activation?: 'automatic' | 'manual';
		/** sm: smaller text and a tighter gap, for compact panels such as dashboard cards. */
		size?: 'sm' | 'md';
		/** line: an underline slides to the chosen tab. folder: the chosen tab rises out of the panel like a folder tab. pill: the chosen tab lifts out of a quiet track. folder and pill are horizontal only. */
		variant?: 'line' | 'folder' | 'pill';
		children: Snippet;
	}

	let {
		value = $bindable(),
		orientation = 'horizontal',
		activation = 'automatic',
		size = 'md',
		variant = 'line',
		children,
		class: className,
		...rest
	}: Props = $props();

	const id = $props.id();

	setTabs({
		get value() {
			return value;
		},
		get orientation() {
			return orientation;
		},
		get activation() {
			return activation;
		},
		get variant() {
			return variant;
		},
		select: (v) => (value = v),
		ids: (v) => {
			const safe = v.replace(/[^\w-]/g, '_');
			return { tab: `${id}-tab-${safe}`, panel: `${id}-panel-${safe}` };
		}
	});
</script>

<div
	class={['tabs', size, variant !== 'line' && orientation === 'horizontal' && variant, className]}
	data-orientation={orientation}
	{...rest}
>
	{@render children()}
</div>

<style>
	/* The list, then every panel stacked in one cell: the area keeps the tallest panel's height,
	   so switching tabs never moves what's below. */
	.tabs {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-content: start;
		gap: 1rem;
		/* In a grid or flex parent, many tabs scroll sideways instead of widening the page. */
		min-inline-size: 0;
		font: var(--ui-font-size)/1.5 var(--ui-font);
		color: var(--ui-fg);
	}
	/* The chosen tab joins the panel, so there's no gap between them. */
	.folder {
		gap: 0;
	}
	.sm {
		gap: 0.75rem;
		font-size: 0.8125rem;
	}
	.tabs[data-orientation='vertical'] {
		grid-template-columns: auto minmax(0, 1fr);
	}
</style>
