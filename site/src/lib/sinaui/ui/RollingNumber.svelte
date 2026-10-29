<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		/** A number, or text you've already formatted ("18px", "40 days"): its digits roll either way. */
		value: number | string;
		/** Intl.NumberFormat options for a number value: percent, currency, units, decimals. */
		format?: Intl.NumberFormatOptions;
		locales?: Intl.LocalesArgument;
		class?: string;
	}

	let { value, format, locales, class: className }: Props = $props();

	const text = $derived(
		typeof value === 'string' ? value : new Intl.NumberFormat(locales, format).format(value)
	);
	// Keyed from the right, so the ones stay the ones when 99 becomes 100 and only the new digit enters.
	const chars = $derived.by(() => {
		const all = [...text];
		return all.map((c, i) => ({ c, key: all.length - i, digit: /[0-9]/.test(c) ? +c : -1 }));
	});

	// Digits that appear later roll up from 0; the ones in the first render stay still.
	let ready = $state(false);
	onMount(() => (ready = true));

	// Always rolls, at the pace values arrive: a lone change takes the full 600ms, quick repeats roll
	// quicker (picking up mid-roll), and a timer's rapid ticks are near-instant rather than churning.
	let roll = $state(600);
	let changedAt = -Infinity;
	$effect.pre(() => {
		void text;
		const now = performance.now();
		const gap = now - changedAt;
		roll = gap < 120 ? 0 : Math.min(600, Math.round(gap * 0.8));
		changedAt = now;
	});
</script>

<!-- Every visible character is CSS generated content, so the only real text is the value itself:
     copying, find-in-page and screen readers all get "1–8", never the digit strips. -->
<span class={['rolling', ready && 'ready', className]} style:--roll="{roll}ms">
	<span class="sr-only">{text}</span><span class="chars" aria-hidden="true">
		{#each chars as { c, key, digit } (key)}
			{#if digit >= 0}
				<span class="digit" data-c={c}><span class="strip" style:--d={digit}></span></span>
			{:else}
				<span data-c={c}></span>
			{/if}
		{/each}
	</span>
</span>

<style>
	.rolling {
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.chars {
		display: inline-flex;
	}
	.digit {
		position: relative;
		display: inline-grid;
		overflow: clip;
		/* Digits blur out at the top and bottom edges as they roll past. */
		mask-image: linear-gradient(transparent, #000 15%, #000 85%, transparent);
	}
	[data-c]::before {
		content: attr(data-c);
		/* Keep spaces ("2.5 mL", "40 days"): a lone space would otherwise collapse to nothing. */
		white-space: pre;
	}
	/* The digit's own glyph, invisible: gives it width, height and baseline. */
	.digit::before {
		visibility: hidden;
	}
	.strip {
		position: absolute;
		inset-block-start: 0;
		inset-inline: 0;
		text-align: center;
		transform: translateY(calc(var(--d) * -10%));
		transition: transform var(--roll, 600ms) var(--ui-ease-out);
	}
	.strip::before {
		content: '0\A 1\A 2\A 3\A 4\A 5\A 6\A 7\A 8\A 9';
		white-space: pre;
	}
	@starting-style {
		.ready .strip {
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.strip {
			transition: none;
		}
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
