<script lang="ts">
	import { getContext } from 'svelte';
	import type { PlaygroundContext } from './context.js';

	// The chapters come from the player's own <track kind="chapters">; this page only adds resume.
	const ctx = getContext<PlaygroundContext>('playground');
	const KEY = 'demo:course:resume';
	let resume = $state<number | null>(null);

	$effect(() => {
		try {
			const saved = Number(localStorage.getItem(KEY));
			if (saved > 5) resume = saved;
		} catch {
			// No storage: the lesson starts from the top.
		}
	});

	// Remember where the viewer was.
	$effect(() => {
		const p = ctx.player;
		if (!p) return;
		const tick = () => {
			try {
				localStorage.setItem(KEY, String(Math.floor(p.currentTime)));
			} catch {
				// Not remembered, which is fine.
			}
		};
		p.addEventListener('timeupdate', tick);
		return () => p.removeEventListener('timeupdate', tick);
	});

	const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

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
	<p class="muted">Lesson 3 of 8 · Chapters are behind the list button in the player; speed and captions are in the gear menu.</p>
</div>

<style>
	h2 {
		margin: 0.25rem 0;
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
</style>
