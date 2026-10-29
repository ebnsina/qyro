<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'role' | 'checked' | 'children'> {
		checked?: boolean;
		/** Visible label. Without it, pass aria-label. */
		children?: Snippet;
	}

	let { checked = $bindable(false), children, class: className, ...rest }: Props = $props();
</script>

<!-- Native checkbox + role=switch: free keyboard, form submission, label click and reset. -->
<label class={['switch', className]}>
	<input type="checkbox" role="switch" bind:checked {...rest} />
	<span class="track" aria-hidden="true"></span>
	{#if children}<span class="label">{@render children()}</span>{/if}
</label>

<style>
	.switch {
		--w: 2.75rem;
		--h: 1.5rem;
		--pad: 3px;
		--thumb: calc(var(--h) - 2px - 2 * var(--pad));
		/* Pressed, the thumb stretches into a pill this much wider (iOS-style). */
		--stretch: 5px;
		--dir: 1;
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		min-block-size: 2.75rem;
		font: var(--ui-font-size)/1.4 var(--ui-font);
		color: var(--ui-fg);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	.switch:dir(rtl) {
		--dir: -1;
	}
	/* Input sits on top of the track so touch, clicks and screen-reader focus land on the real control. */
	input {
		position: absolute;
		inset-inline-start: 0;
		z-index: 1;
		inline-size: var(--w);
		block-size: 100%;
		margin: 0;
		opacity: 0;
		cursor: inherit;
	}
	.track {
		position: relative;
		flex: none;
		box-sizing: border-box;
		inline-size: var(--w);
		block-size: var(--h);
		/* Invisible normally; outlines the track in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: var(--h);
		background: var(--ui-hover);
		transition: background-color var(--ui-dur) ease;
	}
	/* The thumb, not the track, carries state: it keeps 3:1+ contrast against both track colors. */
	.track::before {
		content: '';
		position: absolute;
		inset-block-start: var(--pad);
		inset-inline-start: var(--pad);
		inline-size: var(--thumb);
		block-size: var(--thumb);
		border-radius: var(--thumb);
		background: var(--ui-muted);
		/* Width, not scale: scaling a circle makes an oval, while a pill needs real width. It's one
		   childless 18px pseudo-element, so the cost is negligible. */
		transition:
			translate var(--ui-dur) var(--ui-ease-in-out),
			inline-size var(--ui-dur-press) var(--ui-ease-out),
			background-color var(--ui-dur) ease;
	}
	input:checked + .track {
		background: var(--ui-accent);
	}
	input:checked + .track::before {
		translate: calc((var(--w) - var(--h)) * var(--dir));
		background: var(--ui-on-accent);
	}
	/* Press morph: the thumb stretches toward where it's about to travel. */
	input:active:not(:disabled) + .track::before {
		inline-size: calc(var(--thumb) + var(--stretch));
	}
	input:checked:active:not(:disabled) + .track::before {
		translate: calc((var(--w) - var(--h) - var(--stretch)) * var(--dir));
	}
	input:focus-visible + .track {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.switch:has(input:disabled) {
		opacity: 0.55;
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.track::before {
			transition: background-color var(--ui-dur) ease;
		}
		input:active + .track::before {
			inline-size: var(--thumb);
		}
		input:checked:active + .track::before {
			translate: calc((var(--w) - var(--h)) * var(--dir));
		}
	}
	@media (forced-colors: active) {
		.track::before {
			background: CanvasText;
		}
		input:checked + .track {
			background: Highlight;
		}
		input:checked + .track::before {
			background: HighlightText;
		}
	}
</style>
