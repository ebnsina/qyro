<script lang="ts">
	import { getContext } from 'svelte';
	import type { PlaygroundContext } from './context.js';

	const ctx = getContext<PlaygroundContext>('playground');
	const chapters = [
		{ t: 0, title: 'Opening: morning in the meadow' },
		{ t: 95, title: 'Meet Buck' },
		{ t: 205, title: 'The three troublemakers' },
		{ t: 360, title: 'Buck makes a plan' },
		{ t: 480, title: 'The chase' },
		{ t: 570, title: 'Credits' },
	];
	const KEY = 'demo:course:resume';
	let at = $state(0);
	let resume = $state<number | null>(null);

	$effect(() => {
		try {
			const saved = Number(localStorage.getItem(KEY));
			if (saved > 5) resume = saved;
		} catch {
			// No storage: the lesson starts from the top.
		}
	});

	// Follow the player's time to mark the chapter and remember where the viewer was.
	$effect(() => {
		const p = ctx.player;
		if (!p) return;
		const tick = () => {
			at = p.currentTime;
			try {
				localStorage.setItem(KEY, String(Math.floor(at)));
			} catch {
				// Not remembered, which is fine.
			}
		};
		p.addEventListener('timeupdate', tick);
		return () => p.removeEventListener('timeupdate', tick);
	});

	const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
	const current = $derived(chapters.findLastIndex((c) => c.t <= at));

	function jump(t: number) {
		ctx.player?.seek(t);
		void ctx.player?.play();
	}
</script>

<div class="side-after course-info">
	{#if resume}
		<p class="muted">You stopped at {fmt(resume)}. <button class="link" onclick={() => (jump(resume!), (resume = null))}>Resume</button></p>
	{/if}
	<h2>Storytelling with animals</h2>
	<p class="muted">Lesson 3 of 8 · Speed and captions are in the gear menu.</p>
</div>
<nav class="side-aside" aria-label="Chapters">
	<h3>Chapters</h3>
	<ol>
		{#each chapters as c, i (c.t)}
			<li><button aria-current={i == current ? 'true' : undefined} onclick={() => jump(c.t)}><span>{fmt(c.t)}</span>{c.title}</button></li>
		{/each}
	</ol>
</nav>

<style>
	h2 {
		margin: 0.25rem 0;
		font-size: 1.375rem;
	}

	.muted {
		margin: 0.25rem 0;
		color: var(--ui-muted);
	}

	.link {
		font: inherit;
		color: var(--ui-fg);
		background: none;
		border: 0;
		padding: 0;
		text-decoration: underline;
		cursor: pointer;
	}

	h3 {
		margin: 0 0 0.5rem;
		font-size: 0.8125rem;
		color: var(--ui-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	ol button {
		display: flex;
		gap: 0.75rem;
		width: 100%;
		min-height: 44px;
		padding: 0.5rem 0.6rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		color: var(--ui-fg);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	ol button:hover,
	ol button[aria-current] {
		background: var(--ui-subtle);
	}

	ol span {
		font-family: var(--ui-font-mono);
		color: var(--ui-muted);
		font-size: 0.875rem;
		min-width: 3ch;
	}
</style>
