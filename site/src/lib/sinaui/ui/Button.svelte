<script lang="ts">
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { announce } from './announce';

	type Props = {
		/** link: looks like inline text link (for navigation that shouldn't look like a button). */
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
		/** xs: 24px with a mouse, for compact toolbars. */
		size?: 'xs' | 'sm' | 'md' | 'lg';
		/** Swaps the label for a spinner at the same width; stays focusable but blocks activation. */
		loading?: boolean;
		/** Square button for a lone icon. Give it an aria-label. */
		square?: boolean;
	} & ((HTMLButtonAttributes & { href?: undefined }) | (HTMLAnchorAttributes & { href: string }));

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		square = false,
		class: className,
		children,
		...rest
	}: Props = $props();

	let el = $state<HTMLElement>();
	// Someone who pressed it and is still on it hears that it's busy; the spinner alone is silent.
	$effect(() => {
		if (loading && el === document.activeElement) announce('Loading');
	});
	// iOS Safari only applies :active (the press feedback) when a touch listener exists.
	const noop = () => {};
</script>

{#if rest.href !== undefined}
	<a
		class={['btn', variant, size, square && 'square', className]}
		{...rest as HTMLAnchorAttributes}
		ontouchstart={noop}
	>
		{@render children?.()}
	</a>
{:else}
	{@const attrs = rest as HTMLButtonAttributes}
	<!-- aria-disabled, not disabled: a disabled button drops focus and screen readers lose their place. -->
	<button
		bind:this={el}
		type="button"
		class={['btn', variant, size, square && 'square', loading && 'loading', className]}
		aria-disabled={loading || undefined}
		{...attrs}
		ontouchstart={noop}
		onclick={(e) => (loading ? e.preventDefault() : attrs.onclick?.(e))}
		onkeydown={(e) => {
			// Holding Enter repeats clicks natively: one press, one action (no double submit).
			if (e.key === 'Enter' && e.repeat) e.preventDefault();
			attrs.onkeydown?.(e);
		}}
	>
		<!-- Label stays in place (transparent) under the spinner: same width, same accessible name. -->
		<span class="label">{@render children?.()}</span>
		{#if loading}<span class="spinner" aria-hidden="true"></span>{/if}
	</button>
{/if}

<style>
	.btn {
		/* Sizes include padding and border whether or not the host app has a CSS reset. */
		box-sizing: border-box;
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
		min-block-size: var(--ui-control-h);
		padding-inline: 0.625rem;
		/* Invisible normally; becomes the button's outline in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: var(--ui-radius-control);
		font: 500 var(--ui-button-font)/1 var(--ui-font);
		letter-spacing: -0.005em;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		user-select: none;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		transition:
			transform var(--ui-dur-press) var(--ui-ease-out),
			background-color var(--ui-dur-press) ease,
			color var(--ui-dur-press) ease;
	}
	.btn:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.xs {
		min-block-size: var(--ui-control-h-xs);
		padding-inline: 0.5rem;
		font-size: 0.75rem;
	}
	.sm {
		min-block-size: var(--ui-control-h-sm);
		padding-inline: 0.5rem;
		font-size: 0.8125rem;
	}
	.lg {
		min-block-size: var(--ui-control-h-lg);
		padding-inline: var(--ui-button-pad-lg);
		font-size: 0.9375rem;
	}
	@media (pointer: coarse) {
		.btn {
			min-block-size: var(--ui-control-h-touch);
		}
	}

	.square {
		padding-inline: 0;
		aspect-ratio: 1;
	}
	.label {
		display: inline-flex;
		align-items: center;
		gap: 0.5em;
		transition: opacity var(--ui-dur-press) ease;
	}
	.loading .label {
		opacity: 0;
	}

	.primary {
		background: var(--ui-accent);
		color: var(--ui-on-accent);
	}
	.danger {
		background: var(--ui-danger);
		color: var(--ui-on-danger);
	}
	.secondary {
		border-color: var(--ui-field-line);
		background: var(--ui-surface);
		color: var(--ui-fg);
	}
	.outline {
		background: transparent;
		color: var(--ui-fg);
		border-color: var(--ui-field-line);
	}
	.ghost {
		background: transparent;
		color: var(--ui-fg);
	}
	@media (hover: hover) and (pointer: fine) {
		.primary:hover,
		.danger:hover {
			background-image: linear-gradient(rgb(0 0 0 / 0.1) 0 0);
		}
		.outline:hover,
		.ghost:hover {
			background: var(--ui-hover);
		}
		.secondary:hover {
			background: color-mix(in srgb, var(--ui-fg) 4%, var(--ui-surface));
		}
	}
	.link {
		min-block-size: auto;
		padding: 0;
		border-radius: 4px;
		background: none;
		color: var(--ui-accent);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
		transition: text-decoration-thickness var(--ui-dur-press) ease;
	}
	/* Inline links are exempt from the 44px touch-target rule (WCAG 2.5.8), and don't press down. */
	@media (pointer: coarse) {
		.link {
			min-block-size: auto;
		}
	}
	.btn.link:active {
		transform: none;
	}
	@media (hover: hover) and (pointer: fine) {
		.link:hover {
			text-decoration-thickness: 2px;
		}
	}

	/* Toggle buttons (aria-pressed) show their on state without relying on the icon alone. */
	.secondary[aria-pressed='true'],
	.outline[aria-pressed='true'],
	.ghost[aria-pressed='true'] {
		background: var(--ui-hover);
	}
	/* scale() carries the label with it, which is what reads as a physical press. */
	.btn:active {
		transform: scale(0.97);
	}

	.btn:disabled,
	.btn[aria-disabled='true']:not(.loading) {
		opacity: 0.55;
		cursor: not-allowed;
		transform: none;
	}
	/* Busy, not unavailable: keep full color so the spinner reads as progress. */
	/* Plain arrow: macOS draws the progress cursor as the spinning "app frozen" wheel. */
	.loading {
		cursor: default;
		transform: none;
	}

	.spinner {
		position: absolute;
		inset: 0;
		margin: auto;
		inline-size: 1em;
		block-size: 1em;
		border: 2px solid currentColor;
		border-inline-end-color: transparent;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			scale var(--ui-dur) var(--ui-ease-out);
	}
	@starting-style {
		.spinner {
			opacity: 0;
			scale: 0.9;
		}
	}
	@keyframes spin {
		to {
			rotate: 1turn;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.btn:active {
			transform: none;
		}
		.spinner {
			animation-duration: 2s;
			transition: opacity var(--ui-dur) ease;
		}
	}
</style>
