<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import Icon from '#lib/sinaui/ui/Icon.svelte';
	import RollingNumber from '#lib/sinaui/ui/RollingNumber.svelte';
	import { inView } from '#lib/sinaui/ui/in-view.js';
	import { reduced } from '#lib/sinaui/ui/motion.js';

	interface Props {
		/** The figure. It rolls up from zero the first time the stat scrolls into view. */
		value: number;
		format?: Intl.NumberFormatOptions;
		/** A small muted icon on the right of the figure. */
		icon: ComponentProps<typeof Icon>['icon'];
		/** Position in the row, for the staggered reveal. */
		i: number;
		children: Snippet;
	}

	let { value, format, icon, i, children }: Props = $props();

	// Undefined until the page runs, so without JavaScript the real figure is what shows.
	let start = $state<number | undefined>(undefined);
	const shown = $derived(start ?? value);

	/** Starts the figure at zero and rolls it up on view. Reduced motion shows it at once. */
	function rollUp(node: HTMLElement) {
		if (reduced()) return;
		start = 0;
		return inView(() => (start = undefined), { threshold: 0.5 })(node);
	}
</script>

<li data-reveal-item style:--i={i} {@attach rollUp}>
	<div class="head">
		<strong class="site-display"><RollingNumber value={shown} {format} /></strong>
		<span class="chip"><Icon {icon} size={20} /></span>
	</div>
	<p class="label">{@render children()}</p>
</li>

<style>
	li {
		display: grid;
		gap: 0.75rem;
		align-content: start;
		padding: 1.5rem;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	strong {
		display: block;
	}

	.label {
		margin: 0;
		color: var(--ui-muted);
	}

	.label :global(code) {
		white-space: nowrap;
	}
</style>
