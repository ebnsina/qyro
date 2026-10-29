<script lang="ts">
	import { glide } from './glide';

	interface Props {
		/** What the choice is about. Visible by default; hideLabel keeps it for screen readers only. */
		label: string;
		hideLabel?: boolean;
		/** Span the container's width, segments sharing it equally (say, on phones). */
		fill?: boolean;
		options: { value: string; label: string }[];
		value?: string;
		/** Form field name. Defaults to a unique id so separate controls never merge. */
		name?: string;
		disabled?: boolean;
		class?: string;
	}

	const uid = $props.id();
	let {
		label,
		hideLabel = false,
		fill = false,
		options,
		value = $bindable(),
		name = uid,
		disabled = false,
		class: className
	}: Props = $props();

	let track: HTMLDivElement;
	let thumb: HTMLSpanElement;
	let ready = $state(false);
	// Clicks glide the thumb; arrow keys snap it (as the tabs do).
	let viaPointer = false;

	const place = (animate: boolean) =>
		glide(thumb, track.querySelector<HTMLElement>('input:checked')?.closest('label'), animate, 180);

	$effect(() => {
		void value;
		place(viaPointer);
		ready = true;
	});
	// Re-place on resize: stretching, wrapping, or first layout inside a dialog that opened after mount.
	$effect(() => {
		const ro = new ResizeObserver(() => place(false));
		ro.observe(track);
		return () => ro.disconnect();
	});
</script>

<!-- Native radios in a fieldset: one Tab stop, arrow keys, forms and screen readers for free. -->
<fieldset class={['segmented', fill && 'fill', className]} {disabled}>
	<legend class:sr-only={hideLabel}>{label}</legend>
	<!-- These handlers only note pointer vs keyboard for the thumb's motion; the radios are the controls. -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={track}
		class="track"
		data-ready={ready ? '' : undefined}
		onpointerdown={() => (viaPointer = true)}
		onkeydown={() => (viaPointer = false)}
	>
		<span class="thumb" aria-hidden="true" bind:this={thumb}></span>
		{#each options as o (o.value)}
			<label class="segment">
				<input
					type="radio"
					{name}
					value={o.value}
					checked={value === o.value}
					onchange={() => (value = o.value)}
				/>
				<span>{o.label}</span>
			</label>
		{/each}
	</div>
</fieldset>

<style>
	.segmented {
		margin: 0;
		padding: 0;
		border: 0;
		min-inline-size: 0;
		max-inline-size: 100%;
		font: var(--ui-font-size)/1.4 var(--ui-font);
		color: var(--ui-fg);
	}
	.fill {
		inline-size: 100%;
	}
	legend {
		margin-block-end: 0.375rem;
		padding: 0;
		font-weight: 500;
	}
	/* Stretches with its fieldset like Input does; in a flex row (toolbars) the fieldset hugs it instead. */
	.track {
		position: relative;
		display: flex;
		box-sizing: border-box;
		/* Too many segments for a phone wrap onto a second row, never off the page. */
		flex-wrap: wrap;
		max-inline-size: 100%;
		gap: 0.125rem;
		padding: 0.1875rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-subtle);
	}
	/* The raised thumb glides to the chosen segment (see glide.ts). */
	.thumb {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		border-radius: calc(var(--ui-radius-control) - 0.1875rem);
		background: light-dark(var(--ui-surface), rgb(255 255 255 / 0.12));
		box-shadow: 0 0 0 1px var(--ui-field-line);
		opacity: 0;
		pointer-events: none;
		transition: opacity 150ms ease;
	}
	.segment {
		position: relative;
		display: grid;
		/* Equal widths when stretched; never narrower than its label. */
		flex: 1 1 0;
		place-items: center;
		/* The control height with the track's padding, like Input and Button. */
		min-block-size: calc(var(--ui-control-h) - 0.375rem);
		padding: 0 0.875rem;
		border-radius: calc(var(--ui-radius-control) - 0.1875rem);
		color: var(--ui-muted);
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: color var(--ui-dur-press) ease;
	}
	@media (pointer: coarse) {
		.segment {
			min-block-size: calc(var(--ui-control-h-touch) - 0.25rem);
		}
	}
	@media (hover: hover) and (pointer: fine) {
		.segment:hover {
			color: var(--ui-fg);
		}
	}
	.segment:has(input:checked) {
		color: var(--ui-fg);
	}
	/* Before hydration the thumb isn't placed yet, so the chosen segment raises itself. */
	.track:not([data-ready]) .segment:has(input:checked) {
		background: light-dark(var(--ui-surface), rgb(255 255 255 / 0.12));
		box-shadow: 0 0 0 1px var(--ui-field-line);
	}
	/* The input covers its segment: clicks, touch and screen-reader focus land on the real control. */
	input {
		position: absolute;
		inset: 0;
		margin: 0;
		opacity: 0;
		cursor: inherit;
	}
	.segment:has(input:focus-visible) {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.segmented:disabled .segment {
		opacity: 0.55;
		cursor: not-allowed;
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (forced-colors: active) {
		.segment:has(input:checked) {
			outline: 2px solid Highlight;
		}
	}
</style>
