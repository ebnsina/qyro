<script lang="ts">
	import Player from './Player.svelte';

	const chapters = [
		{ t: 0, title: 'Opening: morning in the meadow' },
		{ t: 95, title: 'Meet Buck' },
		{ t: 205, title: 'The three troublemakers' },
		{ t: 360, title: 'Buck makes a plan' },
		{ t: 480, title: 'The chase' },
		{ t: 570, title: 'Credits' },
	];
	const KEY = 'demo:course:resume';
	let player = $state<HTMLElement & { seek(t: number): void; play(): Promise<void>; currentTime: number }>();
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

	const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
	const current = $derived(chapters.findLastIndex((c) => c.t <= at));

	function jump(t: number) {
		player?.seek(t);
		void player?.play();
	}

	function track(e: Event) {
		at = (e.currentTarget as HTMLElement & { currentTime: number }).currentTime;
		try {
			localStorage.setItem(KEY, String(Math.floor(at)));
		} catch {
			// Not remembered, which is fine.
		}
	}
</script>

<div class="course">
	<div>
		<Player bind:el={player} extra={{ title: 'Lesson 3: Storytelling with animals' }} ontimeupdate={track} />
		{#if resume}
			<p class="course-resume">You stopped at {fmt(resume)}. <button onclick={() => (jump(resume!), (resume = null))}>Resume</button></p>
		{/if}
		<h2>Storytelling with animals</h2>
		<p class="course-meta">Lesson 3 of 8 · Speed and captions are in the gear menu.</p>
	</div>
	<nav aria-label="Chapters">
		<h3>Chapters</h3>
		<ol>
			{#each chapters as c, i (c.t)}
				<li><button aria-current={i == current ? 'true' : undefined} onclick={() => jump(c.t)}><span>{fmt(c.t)}</span>{c.title}</button></li>
			{/each}
		</ol>
	</nav>
</div>

<style>
	.course {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 18rem;
		gap: 2rem;
	}

	.course h2 {
		margin: 1.25rem 0 0.25rem;
	}

	.course-meta,
	.course-resume {
		color: var(--ui-muted);
		margin: 0.25rem 0;
	}

	.course-resume button {
		font: inherit;
		color: var(--ui-fg);
		background: none;
		border: 0;
		text-decoration: underline;
		cursor: pointer;
	}

	.course h3 {
		margin: 0 0 0.5rem;
		font-size: 0.875rem;
		color: var(--ui-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.course ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.course ol button {
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

	.course ol button:hover,
	.course ol button[aria-current] {
		background: var(--ui-subtle);
	}

	.course ol span {
		font-family: var(--ui-font-mono);
		color: var(--ui-muted);
		font-size: 0.875rem;
		min-width: 3ch;
	}

	@container frame (max-width: 760px) {
		.course {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
