<script lang="ts">
	import { getContext } from 'svelte';
	import Button from '#lib/sinaui/ui/Button.svelte';
	import type { PlaygroundContext } from './context.js';

	const ctx = getContext<PlaygroundContext>('playground');

	// The background loop has no controls; "Watch" turns the sound on and goes full screen.
	async function watch() {
		const p = ctx.player;
		if (!p) return;
		p.muted = false;
		p.seek(0);
		await p.toggleFullscreen();
	}
</script>

<div class="side-over hero-copy">
	<p class="kicker">Now showing</p>
	<h2>Tears of Steel</h2>
	<p>A short film about warriors and scientists in a future Amsterdam.</p>
	<Button size="lg" onclick={watch}>Watch</Button>
</div>

<style>
	.hero-copy {
		padding: 6rem 1.5rem 1.75rem;
		color: #fff;
		background: linear-gradient(to top, rgb(0 0 0 / 0.7), transparent);
		pointer-events: none;
	}

	.hero-copy :global(.btn) {
		pointer-events: auto;
	}

	.kicker {
		margin: 0;
		font-size: 0.8125rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.8;
	}

	h2 {
		margin: 0.25rem 0 0.5rem;
		font-size: clamp(2rem, 8cqi, 4rem);
		letter-spacing: -0.04em;
		line-height: 1;
	}

	p:not(.kicker) {
		max-width: 40ch;
		margin: 0 0 1.25rem;
		opacity: 0.9;
	}
</style>
