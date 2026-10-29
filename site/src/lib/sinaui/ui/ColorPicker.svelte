<script lang="ts">
	import { PipetteIcon } from '@hugeicons/core-free-icons';
	import { colorName, hexToHsv, hsvToHex, type Hsv } from './color';
	import Icon from './Icon.svelte';
	import Popover from './Popover.svelte';

	interface Props {
		label: string;
		/** A hex color, "#047857". */
		value?: string;
		/** Suggested colors under the picker; give each a name to have it read by name. */
		swatches?: (string | { color: string; name: string })[];
		/** Form field name: a hidden input carries the hex value. */
		name?: string;
		hint?: string;
		disabled?: boolean;
	}

	let {
		label,
		value = $bindable('#047857'),
		swatches = [],
		name,
		hint,
		disabled = false
	}: Props = $props();

	const id = $props.id();
	// Kept apart from the hex, so hue survives grays and blacks (where the hex has none).
	let hsv = $state<Hsv>(hexToHsv(value) ?? { h: 160, s: 1, v: 0.47 });
	const hex = $derived(hsvToHex(hsv));
	let typed = $state<string>();
	const typedOk = $derived(typed === undefined || !!hexToHsv(typed));

	function set(next: Partial<Hsv>) {
		hsv = { ...hsv, ...next };
		value = hsvToHex(hsv);
	}
	// Set from outside: follow, unless it's the color already shown.
	$effect(() => {
		const v = value;
		const parsed = hexToHsv(v);
		if (parsed && v.toLowerCase() !== hsvToHex(hsv)) hsv = parsed;
	});

	const clamp = (n: number) => Math.min(1, Math.max(0, n));

	/** Drags on a surface: the pointer is captured, so it keeps working past the edges. */
	function drag(e: PointerEvent, apply: (x: number, y: number) => void) {
		if (e.button !== 0) return;
		const el = e.currentTarget as HTMLElement;
		const thumb = el.querySelector<HTMLElement>('[role="slider"]');
		el.setPointerCapture(e.pointerId);
		const at = (p: PointerEvent) => {
			const r = el.getBoundingClientRect();
			const rtl = getComputedStyle(el).direction === 'rtl';
			const x = clamp((p.clientX - r.left) / r.width);
			apply(rtl ? 1 - x : x, clamp((p.clientY - r.top) / r.height));
		};
		at(e);
		e.preventDefault();
		thumb?.focus({ preventScroll: true });
		const move = (p: PointerEvent) => at(p);
		const up = () => {
			el.removeEventListener('pointermove', move);
			el.removeEventListener('pointerup', up);
			el.removeEventListener('pointercancel', up);
		};
		el.addEventListener('pointermove', move);
		el.addEventListener('pointerup', up);
		el.addEventListener('pointercancel', up);
	}

	function areaKeys(e: KeyboardEvent) {
		const step = e.shiftKey ? 0.1 : 0.01;
		const rtl = getComputedStyle(e.currentTarget as Element).direction === 'rtl' ? -1 : 1;
		const keys: Record<string, () => void> = {
			ArrowRight: () => set({ s: clamp(hsv.s + step * rtl) }),
			ArrowLeft: () => set({ s: clamp(hsv.s - step * rtl) }),
			ArrowUp: () => set({ v: clamp(hsv.v + step) }),
			ArrowDown: () => set({ v: clamp(hsv.v - step) }),
			PageUp: () => set({ v: clamp(hsv.v + 0.1) }),
			PageDown: () => set({ v: clamp(hsv.v - 0.1) }),
			Home: () => set({ s: 0 }),
			End: () => set({ s: 1 })
		};
		if (!keys[e.key]) return;
		e.preventDefault();
		keys[e.key]();
	}
	function hueKeys(e: KeyboardEvent) {
		const step = e.shiftKey || e.key.startsWith('Page') ? 10 : 1;
		const rtl = getComputedStyle(e.currentTarget as Element).direction === 'rtl' ? -1 : 1;
		const by: Record<string, number> = {
			ArrowRight: step * rtl,
			ArrowUp: step,
			PageUp: step,
			ArrowLeft: -step * rtl,
			ArrowDown: -step,
			PageDown: -step
		};
		if (e.key === 'Home' || e.key === 'End') {
			e.preventDefault();
			return set({ h: e.key === 'Home' ? 0 : 359 });
		}
		if (by[e.key] === undefined) return;
		e.preventDefault();
		set({ h: (hsv.h + by[e.key] + 360) % 360 });
	}

	const pct = new Intl.NumberFormat('en', { style: 'percent' });
	const described = $derived(`${colorName(hsv)}, ${hex}`);

	const canPick = typeof window !== 'undefined' && 'EyeDropper' in window;
	async function pickFromScreen() {
		try {
			// Chromium only; elsewhere the button isn't shown.
			const dropper = new (
				window as unknown as { EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> } }
			).EyeDropper();
			const { sRGBHex } = await dropper.open();
			const parsed = hexToHsv(sRGBHex);
			if (parsed) set(parsed);
		} catch {
			/* canceled with Escape: keep the color */
		}
	}
</script>

<div class="field">
	<span id="{id}-label" class="label">{label}</span>
	<Popover title={label} hideTitle class="color-popover">
		{#snippet trigger(props)}
			<button
				type="button"
				class="trigger"
				aria-labelledby="{id}-label {id}-value"
				aria-describedby={hint ? `${id}-hint` : undefined}
				{disabled}
				{...props}
			>
				<span class="chip" style:background={hex}></span>
				<!-- Part of the button's name: "Border color #1F4E9C, blue". -->
				<span id="{id}-value" class="hex">{hex}<span class="sr-only">, {colorName(hsv)}</span></span
				>
			</button>
		{/snippet}
		<div class="panel">
			<!-- Saturation across, brightness up: one thumb, one Tab stop, both directions by arrow keys. -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="area"
				style:--hue={hsv.h}
				onpointerdown={(e) => drag(e, (x, y) => set({ s: x, v: 1 - y }))}
			>
				<span
					class="thumb"
					role="slider"
					tabindex="0"
					aria-label="Color"
					aria-roledescription="2D slider"
					aria-valuenow={Math.round(hsv.s * 100)}
					aria-valuetext="{described}. Saturation {pct.format(hsv.s)}, brightness {pct.format(
						hsv.v
					)}"
					style:inset-inline-start="{hsv.s * 100}%"
					style:top="{(1 - hsv.v) * 100}%"
					style:background={hex}
					onkeydown={areaKeys}
				></span>
			</div>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="hue" onpointerdown={(e) => drag(e, (x) => set({ h: Math.min(359, x * 360) }))}>
				<span
					class="thumb"
					role="slider"
					tabindex="0"
					aria-label="Hue"
					aria-valuemin={0}
					aria-valuemax={359}
					aria-valuenow={Math.round(hsv.h)}
					aria-valuetext="{Math.round(hsv.h)}°, {colorName({ h: hsv.h, s: 1, v: 1 })}"
					style:inset-inline-start="{(hsv.h / 360) * 100}%"
					style:background="hsl({hsv.h} 100% 50%)"
					onkeydown={hueKeys}
				></span>
			</div>
			<div class="row">
				<label class="hexfield">
					<span class="sr-only">Hex</span>
					<span class="hash" aria-hidden="true">#</span>
					<input
						value={(typed ?? hex).replace(/^#/, '')}
						maxlength="7"
						spellcheck="false"
						autocomplete="off"
						aria-invalid={!typedOk || undefined}
						oninput={(e) => {
							typed = e.currentTarget.value;
							const parsed = hexToHsv(typed);
							if (parsed) {
								hsv = parsed;
								value = hsvToHex(parsed);
							}
						}}
						onblur={() => (typed = undefined)}
						onkeydown={(e) => e.key === 'Enter' && (typed = undefined)}
					/>
				</label>
				{#if canPick}
					<button
						type="button"
						class="pick"
						aria-label="Pick a color from the screen"
						onclick={pickFromScreen}
					>
						<Icon icon={PipetteIcon} size={16} />
					</button>
				{/if}
			</div>
			{#if swatches.length}
				<div class="swatches" role="group" aria-label="Suggested colors">
					{#each swatches as sw (typeof sw === 'string' ? sw : sw.color)}
						{@const color = typeof sw === 'string' ? sw : sw.color}
						{@const sv = hexToHsv(color)}
						<button
							type="button"
							class="swatch"
							style:background={color}
							aria-label={typeof sw === 'string' ? `${sv ? colorName(sv) : ''} ${color}` : sw.name}
							title={typeof sw === 'string' ? undefined : sw.name}
							aria-pressed={sv ? hsvToHex(sv) === hex : false}
							onclick={() => sv && set(sv)}
						></button>
					{/each}
				</div>
			{/if}
		</div>
	</Popover>
	{#if name}<input type="hidden" {name} value={hex} />{/if}
	{#if hint}<p id="{id}-hint" class="hint">{hint}</p>{/if}
</div>

<style>
	.field {
		display: grid;
		/* Label stays tight when a neighbor is taller. */
		align-content: start;
		justify-items: start;
		gap: 0.25rem;
		font: var(--ui-font-size)/1.5 var(--ui-font);
		color: var(--ui-fg);
	}
	.label {
		font-weight: 500;
	}
	/* Same box as Input; as wide as a hex value. */
	.trigger {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		box-sizing: border-box;
		min-block-size: var(--ui-control-h);
		margin: 0;
		padding-block: 0;
		padding-inline: 0.5rem 0.875rem;
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.trigger:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.chip {
		inline-size: 1.5rem;
		block-size: 1.5rem;
		border-radius: calc(var(--ui-radius-control) * 0.6);
		box-shadow: inset 0 0 0 1px var(--ui-field-line);
		transition: background-color var(--ui-dur) ease;
	}
	.hex {
		font: 0.9375rem var(--ui-font-mono);
		text-transform: uppercase;
	}
	.field :global(.color-popover) {
		padding: 0.75rem;
	}
	/* 15rem, and nothing inside (the hex input's own width) may push it wider. */
	.panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.75rem;
		inline-size: 15rem;
	}
	.area {
		position: relative;
		block-size: 9rem;
		border-radius: var(--ui-radius);
		background:
			linear-gradient(to top, #000, transparent),
			linear-gradient(to right, #fff, hsl(var(--hue) 100% 50%));
		cursor: crosshair;
		touch-action: none;
	}
	.area:dir(rtl) {
		background:
			linear-gradient(to top, #000, transparent),
			linear-gradient(to left, #fff, hsl(var(--hue) 100% 50%));
	}
	.hue {
		position: relative;
		block-size: 0.75rem;
		border-radius: 999px;
		background: linear-gradient(
			to right,
			#f00,
			#ff0 16.67%,
			#0f0 33.33%,
			#0ff 50%,
			#00f 66.67%,
			#f0f 83.33%,
			#f00
		);
		cursor: pointer;
		touch-action: none;
	}
	/* Right to left, the thumb counts from the right, so the colors run that way too. */
	.hue:dir(rtl) {
		background: linear-gradient(
			to left,
			#f00,
			#ff0 16.67%,
			#0f0 33.33%,
			#0ff 50%,
			#00f 66.67%,
			#f0f 83.33%,
			#f00
		);
	}
	/* Thumbs: a ring in the color itself; they grow a little while held. */
	.thumb {
		position: absolute;
		top: 50%;
		inline-size: 1.125rem;
		block-size: 1.125rem;
		border-radius: 50%;
		box-shadow:
			0 0 0 2px #fff,
			0 1px 4px rgb(0 0 0 / 0.35);
		translate: -50% -50%;
		transition: scale var(--ui-dur-press) var(--ui-ease-out);
	}
	.thumb:dir(rtl) {
		translate: 50% -50%;
	}
	:is(.area, .hue):active .thumb {
		scale: 1.15;
	}
	.thumb:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 3px;
	}
	.row {
		display: flex;
		gap: 0.5rem;
	}
	.hexfield {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 0.25rem;
		box-sizing: border-box;
		min-block-size: 2.25rem;
		padding: 0 0.625rem;
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius-control);
		font: 0.9375rem var(--ui-font-mono);
	}
	.hexfield:focus-within {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.hexfield:has([aria-invalid='true']) {
		border-color: var(--ui-danger);
		outline-color: var(--ui-danger);
	}
	.hash {
		color: var(--ui-muted);
	}
	.hexfield input {
		flex: 1;
		inline-size: 0;
		min-inline-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
		outline: none;
		background: none;
		color: inherit;
		font: inherit;
		font-size: var(--ui-control-font);
		text-transform: uppercase;
	}
	.pick {
		display: grid;
		place-items: center;
		inline-size: 2.25rem;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--ui-radius);
		background: var(--ui-subtle);
		color: var(--ui-fg);
		cursor: pointer;
		transition:
			background-color var(--ui-dur-press) ease,
			transform var(--ui-dur-press) var(--ui-ease-out);
	}
	.pick:hover {
		background: var(--ui-hover);
	}
	.pick:active {
		transform: scale(0.94);
	}
	.pick:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	/* Room around the row, so the chosen swatch's ring isn't cut by the popover's edge. */
	.swatches {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 0.375rem;
		margin: -0.25rem;
		padding: 0.25rem;
	}
	.swatch {
		aspect-ratio: 1;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: calc(var(--ui-radius) * 0.6);
		box-shadow: inset 0 0 0 1px var(--ui-field-line);
		cursor: pointer;
		transition: transform var(--ui-dur-press) var(--ui-ease-out);
	}
	.swatch:hover {
		transform: scale(1.08);
	}
	.swatch:active {
		transform: scale(0.94);
	}
	/* The chosen one: a ring with a gap, readable on any color. */
	.swatch[aria-pressed='true'] {
		box-shadow:
			0 0 0 2px var(--ui-surface),
			0 0 0 4px var(--ui-fg);
	}
	.swatch:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 3px;
	}
	.hint {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.8125rem;
	}
	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.thumb,
		.swatch,
		.pick {
			transition: none;
		}
	}
</style>
