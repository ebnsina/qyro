<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		Alert02Icon,
		AlertCircleIcon,
		CheckmarkCircle02Icon,
		InformationCircleIcon
	} from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';

	type IconNode = typeof InformationCircleIcon;

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		tone?: 'neutral' | 'accent' | 'warning' | 'danger';
		/**
		 * The tone's icon, as in Alert: on by default, so meaning never rests on color alone.
		 * false hides it; pass any Hugeicons icon to use your own.
		 */
		icon?: boolean | IconNode;
		/** A small dot instead of an icon, for live status ("Online", "Open now"). */
		dot?: boolean;
		children: Snippet;
	}

	let {
		tone = 'neutral',
		icon = true,
		dot = false,
		children,
		class: className,
		...rest
	}: Props = $props();

	const icons = {
		neutral: InformationCircleIcon,
		accent: CheckmarkCircle02Icon,
		warning: Alert02Icon,
		danger: AlertCircleIcon
	};
	const shown = $derived(dot || icon === false ? undefined : icon === true ? icons[tone] : icon);
</script>

<span class={['badge', tone, className]} {...rest}>
	{#if dot}
		<span class="dot" aria-hidden="true"></span>
	{:else if shown}
		<span class="icon"><Icon icon={shown} size={14} strokeWidth={1.75} /></span>
	{/if}
	{@render children()}
</span>

<style>
	/* Text in the tone on a see-through tint of it, so it sits on any background; no outline.
	   Corners follow the Button's radius, scaled to the badge's height. */
	.badge {
		--tone: var(--ui-muted);
		display: inline-flex;
		align-items: center;
		gap: 0.3125rem;
		box-sizing: border-box;
		min-block-size: 1.5rem;
		padding: 0 0.5rem;
		/* Invisible normally; outlines it in Windows High Contrast. */
		border: 1px solid transparent;
		border-radius: calc(var(--ui-radius-control) * 0.75);
		background: color-mix(in srgb, var(--tone) 10%, transparent);
		/* Tone pulled 20% toward the text color: darker in light mode, lighter in dark, so small text
		   keeps 4.5:1 even on a tinted surface. */
		color: color-mix(in srgb, var(--tone) 80%, var(--ui-fg));
		font: 500 0.75rem/1 var(--ui-font);
		white-space: nowrap;
	}
	/* Icon sits a little in from the edge, as Alert's does. */
	.badge:has(.icon) {
		padding-inline-start: 0.375rem;
	}
	.accent {
		--tone: var(--ui-accent);
	}
	.warning {
		--tone: var(--ui-warning);
	}
	.danger {
		--tone: var(--ui-danger);
	}
	.icon {
		display: grid;
		color: var(--tone);
	}
	.dot {
		inline-size: 0.375rem;
		block-size: 0.375rem;
		border-radius: 50%;
		background: var(--tone);
	}
</style>
