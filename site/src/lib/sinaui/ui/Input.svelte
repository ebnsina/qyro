<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'children'> {
		label: string;
		/** Keeps the label for screen readers only. */
		hideLabel?: boolean;
		value?: string | number | null;
		/** Help text under the field, read out after the label. */
		hint?: string;
		/** Error message; marks the field invalid and is read out with it. */
		error?: string;
		/** Inside the box, before the text: an icon or a prefix like "https://". */
		start?: Snippet;
		/** Inside the box, after the text: a suffix, or a button (show password, clear, copy). */
		end?: Snippet;
		/** The input element, for focusing or selecting from outside. */
		element?: HTMLInputElement;
	}

	const uid = $props.id();
	let {
		label,
		hideLabel = false,
		value = $bindable(),
		hint,
		error,
		start,
		end,
		element = $bindable(),
		id = uid,
		class: className,
		'aria-describedby': describedbyExtra,
		...rest
	}: Props = $props();

	const describedby = $derived(
		[describedbyExtra, hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') ||
			undefined
	);
</script>

<div class={['field', className]}>
	<label for={id} class:sr-only={hideLabel}>{label}</label>
	<!-- The box is the border; start and end sit inside it with the text. -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="control"
		onclick={(e) => {
			// A click on a prefix or padding focuses the text, as it would in a plain input.
			if (e.target === e.currentTarget || (e.target as Element).closest('.addon')) element?.focus();
		}}
	>
		{#if start}<span class="addon start">{@render start()}</span>{/if}
		<input
			bind:this={element}
			{id}
			bind:value
			aria-invalid={error ? true : undefined}
			aria-describedby={describedby}
			{...rest}
		/>
		{#if end}<span class="addon end">{@render end()}</span>{/if}
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
	/* Same height and radius as a medium Button, so they line up in a row. */
	.control {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		/* Shrinks with its field; without this the input's default width can push it past a narrow one. */
		min-inline-size: 0;
		min-block-size: var(--ui-control-h);
		border: 1px solid var(--ui-field-line);
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
		cursor: text;
		transition: border-color var(--ui-dur-press) ease;
	}
	@media (pointer: coarse) {
		.control {
			min-block-size: var(--ui-control-h-touch);
		}
	}
	.control:has(input:focus-visible) {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.control:has(input[aria-invalid='true']) {
		border-color: var(--ui-danger);
		outline-color: var(--ui-danger);
	}
	.control:has(input:disabled) {
		background: var(--ui-subtle);
		opacity: 0.55;
		cursor: not-allowed;
	}
	input {
		box-sizing: border-box;
		appearance: none;
		flex: 1;
		min-inline-size: 0;
		align-self: stretch;
		margin: 0;
		padding: 0 0.75rem;
		border: 0;
		border-radius: inherit;
		outline: none;
		background: none;
		color: inherit;
		/* 16px minimum: iOS Safari zooms the page into any smaller input on focus. */
		font: inherit;
		font-size: var(--ui-control-font);
		/* Neutralize @tailwindcss/forms and similar resets that add their own focus shadow. */
		box-shadow: none;
	}
	input::placeholder {
		color: var(--ui-muted);
		opacity: 1;
	}
	input:disabled {
		cursor: not-allowed;
	}
	/* Hides the browser's own search clear button: SearchField brings one that matches. */
	input::-webkit-search-cancel-button {
		appearance: none;
	}
	.addon {
		display: flex;
		flex: none;
		align-items: center;
		color: var(--ui-muted);
		white-space: nowrap;
	}
	.start {
		padding-inline-start: 0.75rem;
	}
	.start + input {
		padding-inline-start: 0.5rem;
	}
	.end {
		padding-inline-end: 0.75rem;
	}
	/* A button sits closer to the edge than text does. */
	.end:has(:global(button)) {
		padding-inline-end: 0.25rem;
	}
	input:has(+ .end) {
		padding-inline-end: 0.25rem;
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
