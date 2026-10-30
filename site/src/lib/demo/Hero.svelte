<script lang="ts">
	import Button from '#lib/sinaui/ui/Button.svelte';
	import Player from './Player.svelte';

	let el = $state<HTMLElement & { muted: boolean; seek(t: number): void; toggleFullscreen(): Promise<void> }>();

	// The background loop has no controls; "Watch" turns the sound on and goes full screen.
	async function watch() {
		if (!el) return;
		el.muted = false;
		el.seek(0);
		await el.toggleFullscreen();
	}
</script>

<section class="hero-demo">
	<Player bind:el class="hero-demo-video" style="--qyro-radius: 0" />
	<div class="hero-demo-copy">
		<p class="hero-demo-kicker">Now showing</p>
		<h2>Tears of Steel</h2>
		<p>A short film about warriors and scientists in a future Amsterdam.</p>
		<Button size="lg" onclick={watch}>Watch</Button>
	</div>
</section>

<style>
	.hero-demo {
		position: relative;
		min-height: 32rem;
		display: grid;
		align-items: end;
		overflow: hidden;
		background: #000;
	}

	:global(.hero-demo-video) {
		position: absolute !important;
		inset: 0;
		width: 100%;
		height: 100%;
		aspect-ratio: auto !important;
	}

	/* A background loop: no controls, just the film. */
	:global(.hero-demo-video::part(controls)),
	:global(.hero-demo-video::part(big-play-button)),
	:global(.hero-demo-video::part(top-bar)) {
		display: none;
	}

	:global(.hero-demo-video::part(video)) {
		object-fit: cover;
	}

	.hero-demo-copy {
		position: relative;
		padding: 8rem 1.5rem 2rem;
		color: #fff;
		pointer-events: none;
		background: linear-gradient(to top, rgb(0 0 0 / 0.7), transparent);
	}

	.hero-demo-copy :global(.btn) {
		pointer-events: auto;
	}

	.hero-demo-kicker {
		margin: 0;
		font-size: 0.8125rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.8;
	}

	.hero-demo-copy h2 {
		margin: 0.25rem 0 0.5rem;
		font-size: clamp(2rem, 8cqi, 4rem);
		letter-spacing: -0.04em;
		line-height: 1;
	}

	.hero-demo-copy p:not(.hero-demo-kicker) {
		max-width: 40ch;
		margin: 0 0 1.5rem;
		opacity: 0.9;
	}
</style>
