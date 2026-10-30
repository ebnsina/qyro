<script lang="ts">
	// The playground's player: the state's attributes, plus the caption track when captions are on.
	import { getContext } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { CAPTIONS } from './state.js';
	import { file } from '#lib/site/links.js';
	import type { PlayerContext } from './context.js';

	type Props = HTMLAttributes<HTMLElement> & { el?: HTMLElement; extra?: Record<string, unknown> };
	let { el = $bindable(), extra = {}, ...rest }: Props = $props();
	const ctx = getContext<PlayerContext>('player');
</script>

<!-- Captions change the children, so the player is rebuilt for them; everything else updates in place. -->
{#key ctx.captions}
	<qyro-player bind:this={el} {...ctx.attrs} {...extra} {...rest}>
		{#if ctx.captions}<track kind="subtitles" srclang="en" label="English" src={file(CAPTIONS)} default />{/if}
	</qyro-player>
{/key}
