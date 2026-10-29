<script lang="ts" module>
	import type { InformationCircleIcon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';

	export type MorphState = {
		key: string;
		text?: string;
		label?: Snippet;
		icon?: typeof InformationCircleIcon;
		/** A spinner in place of the icon, for "working". */
		spinner?: boolean;
	};
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import Spinner from './Spinner.svelte';

	// Every state sits in one grid cell, so the button is as wide as the widest and never jumps.
	// Icon and text travel together; the old one leaves first, the new one follows, never both at once.
	let { states, current }: { states: MorphState[]; current: string } = $props();

	let left = $state<string>();
	// svelte-ignore state_referenced_locally
	let shown = current;
	$effect.pre(() => {
		if (current !== shown) {
			left = shown;
			shown = current;
		}
	});
</script>

<span class="morph">
	{#each states as s (s.key)}
		<span
			class={['state', s.key === current && 'on', s.key === left && 'left']}
			aria-hidden={s.key !== current}
		>
			{#if s.spinner}<Spinner size={16} />{:else if s.icon}<Icon icon={s.icon} size={16} />{/if}
			{#if s.label}{@render s.label()}{:else if s.text}{s.text}{/if}
		</span>
	{/each}
</span>

<style>
	.morph {
		display: inline-grid;
	}
	.state {
		display: inline-flex;
		grid-area: 1 / 1;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
		opacity: 0;
		translate: 0 0.35em;
		transition:
			opacity 100ms ease,
			translate 100ms ease;
	}
	/* Leaving: up and out, quickly. */
	.left {
		translate: 0 -0.35em;
	}
	/* Arriving: rises into place once the old one has gone. */
	.on {
		opacity: 1;
		translate: 0 0;
		transition:
			opacity 180ms var(--ui-ease-out) 90ms,
			translate 260ms var(--ui-ease-enter) 90ms;
	}
	@media (prefers-reduced-motion: reduce) {
		.state,
		.left,
		.on {
			translate: 0 0;
		}
	}
</style>
