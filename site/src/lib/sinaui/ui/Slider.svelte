<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import RollingNumber from './RollingNumber.svelte';

	type Mark = number | { value: number; label?: string };

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'value'> {
		label: string;
		/** A number, or a pair for a range with two thumbs. */
		value?: number | [number, number];
		min?: number;
		max?: number;
		step?: number;
		hint?: string;
		/** Formats the value for display and for screen readers (aria-valuetext). */
		format?: (value: number) => string;
		/** Locale for the default number format; fixed so server and browser render the same text. */
		locale?: string;
		/** Ticks on the track; labeled ones print under it and can be pressed. */
		marks?: Mark[];
		/** Names for the two thumbs of a range. */
		thumbLabels?: [string, string];
	}

	const uid = $props.id();
	let {
		label,
		value = $bindable(50),
		min = 0,
		max = 100,
		step = 1,
		hint,
		format,
		locale = 'en',
		marks = [],
		thumbLabels,
		id = uid,
		class: className,
		name,
		...rest
	}: Props = $props();

	const range = $derived(Array.isArray(value));
	const values = $derived(Array.isArray(value) ? value : [value]);
	const show = (n: number) => (format ? format(n) : new Intl.NumberFormat(locale).format(n));
	const pct = (n: number) => ((n - min) / (max - min || 1)) * 100;
	const text = $derived(values.map(show).join(' – '));
	const names = $derived(
		thumbLabels ?? [`Lowest ${label.toLowerCase()}`, `Highest ${label.toLowerCase()}`]
	);
	const ticks = $derived(marks.map((m) => (typeof m === 'number' ? { value: m } : m)));
	// The thumb pressed last stays on top, so two thumbs pushed together can always be pulled apart.
	let top = $state(1);

	/** Returns the value it settled on: a range's thumbs stop at each other instead of crossing. */
	function set(i: number, n: number) {
		if (!Array.isArray(value)) return (value = n);
		const [a, b] = value;
		value = i === 0 ? [Math.min(n, b), b] : [a, Math.max(n, a)];
		return value[i];
	}
	// A pressed mark moves the nearest thumb there.
	function jump(n: number) {
		const i = values.length > 1 && Math.abs(n - values[1]) < Math.abs(n - values[0]) ? 1 : 0;
		set(i, n);
	}
</script>

<div
	class={['field', className]}
	role={range ? 'group' : undefined}
	aria-labelledby={range ? `${id}-label` : undefined}
>
	<div class="head">
		<label id="{id}-label" for={range ? undefined : id}>{label}</label>
		<!-- Shown for sighted users; screen readers get the same text from aria-valuetext. -->
		<output for={id} aria-hidden="true"><RollingNumber value={text} /></output>
	</div>
	<div
		class="slider"
		style:--a="{range ? pct(values[0]) : 0}%"
		style:--b="{pct(values[values.length - 1])}%"
	>
		<!-- Track and fill are drawn once; the native inputs on top keep keyboard, touch and forms. -->
		<span class="track" aria-hidden="true">
			<span class="fill"></span>
			{#each ticks as t (t.value)}
				{@const p = pct(t.value)}
				<span
					class={[
						'tick',
						p >= (range ? pct(values[0]) : 0) && p <= pct(values[values.length - 1]) && 'in'
					]}
					style:--p="{p}%"
				></span>
			{/each}
		</span>
		{#each values as v, i (i)}
			<input
				type="range"
				id={i === 0 ? id : `${id}-${i}`}
				class={['thumb', top === i && 'top']}
				{min}
				{max}
				{step}
				{name}
				disabled={rest.disabled}
				value={v}
				aria-label={range ? names[i] : undefined}
				aria-valuetext={show(v)}
				aria-describedby={hint ? `${id}-hint` : undefined}
				oninput={(e) => {
					// Held at the other thumb: put the native thumb back where the value stopped.
					const n = set(i, e.currentTarget.valueAsNumber);
					if (n !== e.currentTarget.valueAsNumber) e.currentTarget.value = String(n);
				}}
				onpointerdown={() => (top = i)}
				onfocus={() => (top = i)}
				{...i === 0 ? rest : {}}
			/>
			<!-- Rises over the thumb while it's dragged, so a finger doesn't hide the value. -->
			<span class={['bubble', `b${i}`]} style:--p={pct(v)} aria-hidden="true"
				><RollingNumber value={show(v)} /></span
			>
		{/each}
	</div>
	{#if ticks.some((t) => t.label)}
		<div class="labels" aria-hidden="true">
			{#each ticks as t (t.value)}
				{#if t.label}
					<button
						type="button"
						tabindex="-1"
						style:--p="{pct(t.value)}%"
						disabled={rest.disabled}
						onclick={() => jump(t.value)}>{t.label}</button
					>
				{/if}
			{/each}
		</div>
	{/if}
	{#if hint}<p id="{id}-hint" class="hint">{hint}</p>{/if}
</div>

<style>
	.field {
		display: grid;
		/* Label stays tight when a neighbor is taller. */
		align-content: start;
		gap: 0.25rem;
		font: var(--ui-font-size)/1.5 var(--ui-font);
		color: var(--ui-fg);
	}
	.head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	label {
		font-weight: 500;
	}
	output {
		color: var(--ui-muted);
		font-variant-numeric: tabular-nums;
	}
	.slider {
		--track: 0.375rem;
		--thumb: 1.125rem;
		position: relative;
		/* Tall enough to grab; the track itself stays thin. */
		block-size: 1.75rem;
	}
	@media (pointer: coarse) {
		.slider {
			block-size: 2.75rem;
		}
	}
	/* Runs between the thumb's center at each end, so the fill meets the thumb exactly. */
	.track {
		position: absolute;
		inset-block-start: calc(50% - var(--track) / 2);
		inset-inline: calc(var(--thumb) / 2);
		block-size: var(--track);
		border-radius: 999px;
		background: var(--ui-hover);
	}
	.fill {
		position: absolute;
		inset-block: 0;
		inset-inline-start: calc(var(--a) - var(--track) / 2);
		inline-size: calc(var(--b) - var(--a) + var(--track));
		border-radius: 999px;
		background: var(--ui-accent);
	}
	.tick {
		position: absolute;
		inset-block-start: 50%;
		inset-inline-start: var(--p);
		inline-size: 0.25rem;
		block-size: 0.25rem;
		border-radius: 50%;
		background: var(--ui-muted);
		opacity: 0.5;
		translate: -50% -50%;
	}
	.tick:dir(rtl) {
		translate: 50% -50%;
	}
	.tick.in {
		background: var(--ui-on-accent);
		opacity: 0.7;
	}
	/* The native inputs: transparent tracks laid over ours; only their thumbs take the pointer. */
	.thumb {
		position: absolute;
		inset: 0;
		appearance: none;
		inline-size: 100%;
		block-size: 100%;
		margin: 0;
		background: transparent;
		cursor: pointer;
		pointer-events: none;
	}
	.thumb.top {
		z-index: 1;
	}
	/* One thumb: the whole track takes presses, as a single native slider does. */
	.slider:has(.thumb:only-of-type) .thumb {
		pointer-events: auto;
	}
	.thumb::-webkit-slider-runnable-track {
		block-size: 100%;
		background: none;
	}
	.thumb::-moz-range-track {
		background: none;
	}
	.thumb::-webkit-slider-thumb {
		appearance: none;
		inline-size: var(--thumb);
		block-size: var(--thumb);
		margin-block-start: calc((1.75rem - var(--thumb)) / 2);
		border: 0;
		border-radius: 50%;
		background: var(--ui-accent);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
		pointer-events: auto;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	@media (pointer: coarse) {
		.thumb::-webkit-slider-thumb {
			margin-block-start: calc((2.75rem - var(--thumb)) / 2);
		}
	}
	.thumb::-moz-range-thumb {
		inline-size: var(--thumb);
		block-size: var(--thumb);
		border: 0;
		border-radius: 50%;
		background: var(--ui-accent);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
		pointer-events: auto;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	/* Pressed: the thumb swells under the finger. */
	.thumb:active::-webkit-slider-thumb {
		scale: 1.2;
	}
	.thumb:active::-moz-range-thumb {
		scale: 1.2;
	}
	.thumb:focus-visible {
		outline: none;
	}
	.thumb:focus-visible::-webkit-slider-thumb {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.thumb:focus-visible::-moz-range-thumb {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.thumb:disabled {
		cursor: not-allowed;
	}
	.slider:has(.thumb:disabled) {
		opacity: 0.55;
	}

	.bubble {
		position: absolute;
		inset-block-end: calc(100% + 0.125rem);
		inset-inline-start: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--p) / 100);
		padding: 0.125rem 0.5rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-fg);
		color: var(--ui-bg);
		font-size: 0.8125rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		translate: -50% 0.25rem;
		scale: 0.85;
		transform-origin: bottom center;
		transition:
			opacity var(--ui-dur-exit) ease,
			translate var(--ui-dur-exit) ease,
			scale var(--ui-dur-exit) ease;
	}
	.bubble:dir(rtl) {
		translate: 50% 0.25rem;
	}
	.slider:has(.thumb:nth-of-type(1):active) .b0,
	.slider:has(.thumb:nth-of-type(2):active) .b1 {
		opacity: 1;
		translate: -50% 0;
		scale: 1;
		transition:
			opacity var(--ui-dur) var(--ui-ease-out),
			translate var(--ui-dur-spring) var(--ui-ease-spring),
			scale var(--ui-dur-spring) var(--ui-ease-spring);
	}
	.slider:has(.thumb:nth-of-type(1):active) .b0:dir(rtl),
	.slider:has(.thumb:nth-of-type(2):active) .b1:dir(rtl) {
		translate: 50% 0;
	}

	/* Mark labels sit under their ticks; pressing one moves the nearest thumb there. */
	.labels {
		position: relative;
		block-size: 1.25rem;
		margin-inline: calc(var(--thumb, 1.125rem) / 2);
	}
	.labels button {
		position: absolute;
		inset-inline-start: var(--p);
		margin: 0;
		padding: 0 0.25rem;
		border: 0;
		border-radius: 4px;
		background: none;
		color: var(--ui-muted);
		font: 0.75rem/1.25rem var(--ui-font);
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		translate: -50% 0;
		transition: color var(--ui-dur-press) ease;
	}
	.labels button:dir(rtl) {
		translate: 50% 0;
	}
	@media (hover: hover) {
		.labels button:hover:not(:disabled) {
			color: var(--ui-fg);
		}
	}
	.labels button:disabled {
		cursor: not-allowed;
	}
	.hint {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.thumb:active::-webkit-slider-thumb,
		.thumb:active::-moz-range-thumb {
			scale: none;
		}
		.bubble,
		.slider:has(.thumb:nth-of-type(1):active) .b0,
		.slider:has(.thumb:nth-of-type(2):active) .b1 {
			scale: 1;
			transition: opacity var(--ui-dur) ease;
		}
	}
</style>
