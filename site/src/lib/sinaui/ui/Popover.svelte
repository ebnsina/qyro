<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createAttachmentKey } from 'svelte/attachments';
	import { anchored, type Side } from './floating';

	interface Props {
		open?: boolean;
		/** Names the popover for screen readers and heads its content. */
		title: string;
		/** Keep the title for screen readers only, when the content already makes it obvious. */
		hideTitle?: boolean;
		side?: Side;
		align?: 'start' | 'center';
		/** Render your trigger (usually a Button) and spread these props onto it. */
		trigger: Snippet<[HTMLButtonAttributes]>;
		children: Snippet;
		class?: string;
	}

	let {
		open = $bindable(false),
		title,
		hideTitle = false,
		side = 'bottom',
		align = 'start',
		trigger,
		children,
		class: className
	}: Props = $props();

	const id = $props.id();
	let button: HTMLElement;
	let panel: HTMLDivElement;

	function close(returnFocus = true) {
		if (returnFocus && panel.contains(document.activeElement)) button.focus();
		open = false;
	}

	const float = anchored(
		() => button,
		() => panel,
		() => close(false),
		// Getters: placement reads the current props each time, so they can change after mount.
		{
			get side() {
				return side;
			},
			get align() {
				return align;
			},
			gap: 8
		}
	);

	// Non-modal dialog: focus moves in on open (first control, else the panel itself).
	$effect(() => {
		if (!open) {
			// However it closed (including by its own content, like a date being chosen), focus inside
			// goes back to the trigger instead of dropping to the page.
			if (panel.contains(document.activeElement)) button?.focus();
			float.close();
			return;
		}
		float.open();
		const first = panel.querySelector<HTMLElement>(
			'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
		);
		(first ?? panel).focus({ preventScroll: true });
	});
	$effect(() => () => float.destroy());

	const triggerProps: HTMLButtonAttributes = $derived({
		'aria-haspopup': 'dialog',
		'aria-expanded': open,
		'aria-controls': `${id}-panel`,
		onclick: () => (open ? close() : (open = true)),
		[createAttachmentKey()]: (el: HTMLElement) => {
			button = el;
		}
	});
</script>

{@render trigger(triggerProps)}

<!-- Right after its trigger in the DOM, so Tab moves from the trigger straight into the content. -->
<div
	bind:this={panel}
	id="{id}-panel"
	role="dialog"
	aria-labelledby="{id}-title"
	tabindex="-1"
	popover="manual"
	class={['popover', className]}
	onkeydown={(e) => {
		if (e.key !== 'Escape') return;
		e.preventDefault();
		close();
	}}
	onfocusout={(e) => {
		// Tabbing or clicking away closes it; focus stays where the person moved it.
		const to = e.relatedTarget as Node | null;
		if (open && to && !panel.contains(to) && !button.contains(to)) close(false);
	}}
>
	<p id="{id}-title" class={['title', hideTitle && 'sr-only']}>{title}</p>
	{@render children()}
</div>

<style>
	.popover {
		position: fixed;
		inset: auto;
		margin: 0;
		box-sizing: border-box;
		inline-size: max-content;
		max-inline-size: min(20rem, 100vw - 16px);
		max-block-size: calc(100dvh - 16px);
		overflow: auto;
		padding: 1rem;
		/* Invisible normally; outlines it in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: var(--ui-surface-overlay);
		color: var(--ui-fg);
		font: var(--ui-font-size)/1.5 var(--ui-font);
		/* Rendered inline beside its trigger: don't inherit centered running text. */
		text-align: start;
		box-shadow: var(--ui-shadow-overlay);
	}
	.popover:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: var(--ui-ring-offset);
	}
	.title {
		margin: 0 0 0.375rem;
		font-weight: 600;
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
