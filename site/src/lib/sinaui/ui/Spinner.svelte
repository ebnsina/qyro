<script lang="ts">
	interface Props {
		/** Diameter in px. */
		size?: number;
		/** What's loading ("Loading manuscripts"). Without it the spinner is decoration beside your own text. */
		label?: string;
		/** ms before it appears, so quick loads never flash it. */
		delay?: number;
		class?: string;
	}

	let { size = 16, label, delay = 0, class: className }: Props = $props();
</script>

<!-- Indeterminate progress, as React Aria's ProgressCircle: no value, just a name. -->
<span
	class={['spinner', className]}
	role={label ? 'progressbar' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	style:--size="{size}px"
	style:--delay="{delay}ms"
></span>

<style>
	.spinner {
		display: inline-block;
		flex: none;
		inline-size: var(--size);
		block-size: var(--size);
		vertical-align: middle;
		border-radius: 50%;
		/* A ring that tapers into its tail: a conic sweep masked to a 2px band. */
		background: conic-gradient(from 90deg, transparent 10%, currentColor);
		mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1.5px));
		animation:
			appear var(--ui-dur) var(--ui-ease-out) var(--delay) both,
			spin 0.8s linear infinite;
	}
	@keyframes appear {
		from {
			opacity: 0;
			scale: 0.8;
		}
	}
	@keyframes spin {
		to {
			rotate: 1turn;
		}
	}
	/* Still turning (it's the only sign of progress), just slowly. */
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation:
				appear var(--ui-dur) ease var(--delay) both,
				spin 2s linear infinite;
		}
	}
</style>
