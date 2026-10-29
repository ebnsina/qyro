<script lang="ts">
	import { getContext } from 'svelte';
	import type { PlaygroundContext } from './context.js';

	const ctx = getContext<PlaygroundContext>('playground');
	const episodes = [
		{ source: 'bbb-hls', title: 'Big Buck Bunny', length: '10:34' },
		{ source: 'sintel', title: 'Sintel', length: '14:48' },
		{ source: 'tos', title: 'Tears of Steel', length: '12:14' },
	];
	const index = $derived(Math.max(0, episodes.findIndex((e) => e.source == ctx.state.source)));
	const next = $derived(episodes[index + 1]);

	// The list drives the one player: choosing an episode swaps its source, and the end plays the next.
	$effect(() => {
		const p = ctx.player;
		if (!p) return;
		const ended = () => next && ctx.set({ source: next.source, autoplay: true });
		p.addEventListener('ended', ended);
		return () => p.removeEventListener('ended', ended);
	});
</script>

<div class="side-after">{#if next}<p class="next">Up next: {next.title}</p>{/if}</div>
<ol class="side-aside" aria-label="Episodes">
	{#each episodes as ep, i (ep.source)}
		<li>
			<button aria-current={i == index ? 'true' : undefined} onclick={() => ctx.set({ source: ep.source })}>
				<span class="n">{i + 1}</span><span class="t">{ep.title}</span><span class="l">{ep.length}</span>
			</button>
		</li>
	{/each}
</ol>

<style>
	.next {
		margin: 0;
		color: var(--ui-muted);
	}

	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	button {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		min-height: 52px;
		padding: 0.5rem 0.75rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		color: var(--ui-fg);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	button:hover,
	button[aria-current] {
		background: var(--ui-subtle);
	}

	.n,
	.l {
		font-family: var(--ui-font-mono);
		color: var(--ui-muted);
		font-size: 0.875rem;
	}

	.t {
		flex: 1;
	}
</style>
