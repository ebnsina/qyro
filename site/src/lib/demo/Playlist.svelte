<script lang="ts">
	import { getContext } from 'svelte';
	import { file } from '#lib/site/links.js';
	import { media } from '#lib/site/media.js';
	import { CAPTIONS } from './state.js';
	import type { PlayerContext } from './context.js';

	// A playlist brings its own videos; the playground's other settings still apply.
	const ctx = getContext<PlayerContext>('player');

	const episodes = [
		{ id: 'bbb', title: media.bbb.title, src: media.bbb.hls, poster: media.bbb.poster, thumbnails: file(media.bbb.storyboard), length: '10:34' },
		{ id: 'sintel', title: media.sintel.title, src: media.sintel.hls, length: '14:48' },
		{ id: 'tos', title: media.tos.title, src: media.tos.hls, length: '12:14' },
	];
	let index = $state(0);
	const now = $derived(episodes[index]);
	const next = $derived(episodes[index + 1]);

	// Changing src loads the next episode; autoplay carries on from the one that ended.
	function play(i: number) {
		index = i;
	}
</script>

<div class="playlist">
	<div>
		<qyro-player {...ctx.attrs} src={now.src} poster={now.poster} title={now.title} thumbnails={now.thumbnails} autoplay={index > 0 || ctx.attrs.autoplay ? true : undefined} onended={() => next && play(index + 1)}>
			{#if ctx.captions}<track kind="subtitles" srclang="en" label="English" src={file(CAPTIONS)} default />{/if}
		</qyro-player>
		{#if next}<p class="playlist-next">Up next: {next.title}</p>{/if}
	</div>
	<ol aria-label="Episodes">
		{#each episodes as ep, i (ep.id)}
			<li>
				<button aria-current={i == index ? 'true' : undefined} onclick={() => play(i)}>
					<span class="n">{i + 1}</span>
					<span class="t">{ep.title}</span>
					<span class="l">{ep.length}</span>
				</button>
			</li>
		{/each}
	</ol>
</div>

<style>
	.playlist {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 18rem;
		gap: 2rem;
	}

	.playlist-next {
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

	@container frame (max-width: 760px) {
		.playlist {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
