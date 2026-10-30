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
		/* 36×20 track, 16px knob: iOS and Radix proportions at desktop size. */
		--w: 2.25rem;
		--h: 1.25rem;
		--pad: 2px;
		--thumb: calc(var(--h) - 2 * var(--pad));
		/* Pressed, the knob stretches into a pill this much wider (iOS-style). */
		--stretch: 4px;
		--dir: 1;
		--dur: 180ms;
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		min-block-size: var(--ui-control-h);
		font: var(--ui-font-size)/1.4 var(--ui-font);
		color: var(--ui-fg);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	/* Fingers get a 44px target, label or not. */
	@media (pointer: coarse) {
		.switch {
			min-block-size: var(--ui-control-h-touch);
			min-inline-size: var(--ui-control-h-touch);
		}
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
		/* Off: a light track with a hairline, so it reads on white, gray or tinted pages alike. */
		background: var(--ui-hover);
		box-shadow: inset 0 0 0 1px var(--ui-field-line);
		transition:
			background-color var(--dur) ease,
			box-shadow var(--dur) ease;
	}
	/* The knob: white with a soft shadow; on, the accent track carries the state. */
	.track::before {
		content: '';
		position: absolute;
		inset-block-start: calc(var(--pad) - 1px);
		inset-inline-start: calc(var(--pad) - 1px);
		inline-size: var(--thumb);
		block-size: var(--thumb);
		border-radius: var(--thumb);
		background: #fff;
		box-shadow:
			0 1px 2px rgb(0 0 0 / 0.2),
			0 0 0 0.5px rgb(0 0 0 / 0.06);
		/* Width, not scale: scaling a circle makes an oval, while a pill needs real width. */
		transition:
			translate var(--dur) var(--ui-ease-out),
			inline-size var(--ui-dur-press) var(--ui-ease-out),
			background-color var(--dur) ease;
	}
	input:checked + .track {
		background: var(--ui-accent);
		box-shadow: none;
	}
	input:checked + .track::before {
		translate: calc((var(--w) - var(--h)) * var(--dir));
		/* White on the black track (light); onyx on the light track (dark), so the knob always shows. */
		background: var(--ui-on-accent);
	}
	/* Press morph: the knob stretches toward where it's about to travel. */
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
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.track::before {
			transition: background-color var(--dur) ease;
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
