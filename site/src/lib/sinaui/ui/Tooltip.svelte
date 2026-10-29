<script lang="ts" module>
	// Shared across tooltips: once one has shown, the next opens instantly (no delay, no animation).
	let lastHidden = 0;
</script>

<script lang="ts">
	import { ease, reduced } from './motion';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { createAttachmentKey } from 'svelte/attachments';
	import { place, type Side } from './floating';

	interface Props {
		/** Short plain text. Tooltips can't hold links or buttons: nobody could reach them. */
		text: string;
		/** The tooltip is the trigger's name (icon-only buttons), instead of an extra description. */
		labels?: boolean;
		side?: Side;
		/** Render your trigger and spread these props onto it. */
		trigger: Snippet<[HTMLButtonAttributes]>;
	}

	let { text, labels = false, side = 'top', trigger }: Props = $props();

	const id = $props.id();
	let anchor: HTMLElement;
	let tip: HTMLDivElement;
	// Rendered in markup (not only set by place()) so the arrow's side styles are part of the component.
	let placed = $state<Side>('top');
	let showTimer: ReturnType<typeof setTimeout> | undefined;
	let hideTimer: ReturnType<typeof setTimeout> | undefined;

	const isOpen = () => tip?.matches(':popover-open');

	// WCAG 1.4.13: Escape dismisses it from anywhere, without moving the pointer or focus.
	const onEscape = (e: KeyboardEvent) => {
		if (e.key !== 'Escape' || !isOpen()) return;
		e.preventDefault();
		hide(0, true);
	};

	// Wanted = hovered or focused. It shows only while its trigger is on screen: focusing an off-screen
	// trigger scrolls it into view *after* focus in Safari, so placement retries on every scroll.
	let wanted = false;

	function reveal(animate: boolean) {
		if (!wanted) return;
		if (!isOpen()) tip.showPopover();
		const s = place(anchor, tip, { side, align: 'center', gap: 8 });
		if (!s) {
			tip.hidePopover();
			return;
		}
		placed = s;
		if (!animate) return;
		const reduce = reduced();
		tip.animate(
			reduce
				? [{ opacity: 0 }, { opacity: 1 }]
				: [
						{ opacity: 0, transform: 'scale(0.97)' },
						{ opacity: 1, transform: 'none' }
					],
			{ duration: 125, easing: ease.standard }
		);
	}
	const follow = () => reveal(false);

	function listen(on: boolean) {
		const method = on ? 'addEventListener' : 'removeEventListener';
		document[method]('keydown', onEscape as EventListener, true);
		window[method]('scroll', follow, true);
		window[method]('resize', follow);
	}

	function show(delay: number) {
		clearTimeout(hideTimer);
		if (wanted) return;
		wanted = true;
		const warm = performance.now() - lastHidden < 300;
		clearTimeout(showTimer);
		showTimer = setTimeout(
			() => {
				listen(true);
				reveal(!warm);
			},
			warm ? 0 : delay
		);
	}

	/** dismissed: Escape. A deliberate dismissal doesn't make the next tooltip open instantly. */
	function hide(delay = 0, dismissed = false) {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		hideTimer = setTimeout(() => {
			if (!wanted) return;
			wanted = false;
			listen(false);
			if (!isOpen()) return;
			tip.hidePopover();
			lastHidden = dismissed ? 0 : performance.now();
		}, delay);
	}

	$effect(() => () => {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		listen(false);
	});

	const triggerProps: HTMLButtonAttributes = $derived({
		[labels ? 'aria-labelledby' : 'aria-describedby']: id,
		// Hover waits a moment so passing the pointer across a toolbar doesn't flash tooltips.
		onpointerenter: (e: PointerEvent) => e.pointerType !== 'touch' && show(400),
		// A short grace period lets the pointer travel onto the tooltip without it vanishing.
		onpointerleave: () => hide(120),
		// Keyboard focus shows it at once; focus from a mouse click doesn't.
		onfocus: (e: FocusEvent) =>
			(e.currentTarget as HTMLElement).matches(':focus-visible') && show(0),
		onblur: () => hide(),
		// Pressing the trigger means they've moved on to acting: get out of the way.
		onpointerdown: () => hide(),
		[createAttachmentKey()]: (el: HTMLElement) => {
			anchor = el;
		}
	});
</script>

{@render trigger(triggerProps)}

<div
	bind:this={tip}
	{id}
	role="tooltip"
	popover="manual"
	data-side={placed}
	class="tip"
	onpointerenter={() => clearTimeout(hideTimer)}
	onpointerleave={() => hide(120)}
>
	{text}
</div>

<style>
	.tip {
		box-sizing: border-box;
		position: fixed;
		inset: auto;
		margin: 0;
		max-inline-size: min(16rem, 100vw - 16px);
		padding: 0.375rem 0.625rem;
		/* Invisible normally; outlines the tooltip in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius) - 2px);
		background: var(--ui-fg);
		color: var(--ui-bg);
		font: 500 0.8125rem/1.4 var(--ui-font);
		text-wrap: balance;
		overflow: visible;
	}
	/* Arrow: a rotated square in the tooltip's color, pointing at the trigger's center even when the
	   tooltip itself was pushed sideways to stay on screen; kept clear of the rounded corners. */
	.tip::after {
		box-sizing: border-box;
		content: '';
		position: absolute;
		left: clamp(0.5rem, var(--anchor-x, 50%), calc(100% - 0.5rem));
		inline-size: 0.5rem;
		block-size: 0.5rem;
		background: inherit;
		border: inherit;
		border-radius: 1px;
		translate: -50% 0;
		rotate: 45deg;
	}
	.tip[data-side='top']::after {
		inset-block-start: calc(100% - 0.3rem);
		border-block-start-color: transparent;
		border-inline-start-color: transparent;
	}
	.tip[data-side='bottom']::after {
		inset-block-end: calc(100% - 0.3rem);
		border-block-end-color: transparent;
		border-inline-end-color: transparent;
	}
	.tip:is([data-side='left'], [data-side='right'])::after {
		top: clamp(0.5rem, var(--anchor-y, 50%), calc(100% - 0.5rem));
		translate: 0 -50%;
	}
	.tip[data-side='left']::after {
		left: calc(100% - 0.3rem);
		border-top-color: transparent;
		border-right-color: transparent;
		border-bottom-color: transparent;
	}
	.tip[data-side='right']::after {
		left: auto;
		right: calc(100% - 0.3rem);
		border-top-color: transparent;
		border-left-color: transparent;
		border-right-color: transparent;
	}
</style>
