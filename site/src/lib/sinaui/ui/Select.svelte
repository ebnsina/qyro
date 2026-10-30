<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';

	interface Props extends Omit<HTMLSelectAttributes, 'value' | 'children'> {
		/** What the choice is about. Visible by default; hideLabel keeps it for screen readers only. */
		label: string;
		hideLabel?: boolean;
		value?: string;
		/** Shown until a choice is made; it can't be chosen back. */
		placeholder?: string;
		hint?: string;
		error?: string;
		/** The <option> and <optgroup> elements. */
		children: Snippet;
	}

	const uid = $props.id();
	let {
		label,
		hideLabel = false,
		value = $bindable(''),
		placeholder,
		hint,
		error,
		children,
		onpointerdown,
		onkeydown,
		onblur,
		id = uid,
		class: className,
		...rest
	}: Props = $props();

	// Chromium keeps :focus-visible on a <select> after a mouse pick; the ring is for keyboard use only.
	let pointer = $state(false);

	const describedby = $derived(
		[hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
	);
</script>

<!-- Native <select>: the platform picker (a sheet on phones), keyboard, typeahead and forms for free. -->
<div class={['field', className]}>
	<label for={id} class:sr-only={hideLabel}>{label}</label>
	<div class="control">
		<select
			{id}
			bind:value
			aria-invalid={error ? true : undefined}
			aria-describedby={describedby}
			data-pointer={pointer || undefined}
			onpointerdown={(e) => ((pointer = true), onpointerdown?.(e))}
			onkeydown={(e) => ((pointer = false), onkeydown?.(e))}
			onblur={(e) => ((pointer = false), onblur?.(e))}
			{...rest}
		>
			{#if placeholder}<option value="" disabled>{placeholder}</option>{/if}
			{@render children()}
		</select>
		<span class="chev" aria-hidden="true"><Icon icon={ArrowDown01Icon} size={16} /></span>
	</div>
	{#if hint}<p id="{id}-hint" class="hint">{hint}</p>{/if}
	{#if error}<p id="{id}-error" class="error">{error}</p>{/if}
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
	label {
		font-weight: 500;
	}
	.control {
		position: relative;
	}
	/* Same box as Input: border, radius and 40px height, so they line up in a form. */
	select {
		appearance: none;
		box-sizing: border-box;
		inline-size: 100%;
		min-block-size: var(--ui-control-h);
		margin: 0;
		padding-block: 0;
		padding-inline: 0.75rem 2.25rem;
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		color: inherit;
		/* 16px minimum: iOS Safari zooms the page into any smaller field on focus. */
		font: inherit;
		font-size: var(--ui-control-font);
		box-shadow: none;
		cursor: pointer;
	}
	@media (pointer: coarse) {
		select {
			min-block-size: var(--ui-control-h-touch);
		}
	}
	/* The placeholder reads as a hint, not a value. */
	select:has(option[value='']:checked) {
		color: var(--ui-muted);
	}
	/* ...but the open list shows every option in normal text (options come from the parent's markup). */
	select :global(option) {
		color: var(--ui-fg);
	}
	select[data-pointer] {
		outline: none;
	}
	select:focus-visible:not([data-pointer]) {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	select[aria-invalid='true'] {
		border-color: var(--ui-danger);
	}
	select[aria-invalid='true']:focus-visible {
		outline-color: var(--ui-danger);
	}
	select:disabled {
		background: var(--ui-subtle);
		opacity: 0.55;
		cursor: not-allowed;
	}
	.chev {
		position: absolute;
		inset-block: 0;
		inset-inline-end: 0.75rem;
		display: grid;
		place-items: center;
		color: var(--ui-muted);
		pointer-events: none;
	}
	.hint,
	.error {
		margin: 0;
		font-size: 0.8125rem;
	}
	.hint {
		color: var(--ui-muted);
	}
	.error {
		color: var(--ui-danger);
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
