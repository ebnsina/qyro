<script lang="ts">
	import Player from './Player.svelte';
	import { media } from '#lib/site/media.js';

	// A demo audience number that drifts like a real one; a real site would read it from its server.
	let viewers = $state(1284);
	$effect(() => {
		const t = setInterval(() => (viewers = Math.max(900, viewers + Math.round((Math.random() - 0.45) * 12))), 3000);
		return () => clearInterval(t);
	});
	const count = $derived(new Intl.NumberFormat('en-US').format(viewers));
</script>

<div class="live-demo">
	<Player />
	<div class="live-demo-bar">
		<div>
			<h2>Opening keynote</h2>
			<p>{media.live.credit}</p>
		</div>
		<p class="live-demo-viewers" aria-live="polite"><span class="dot" aria-hidden="true"></span>{count} watching</p>
	</div>
</div>

<style>
	.live-demo-bar {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
		margin-top: 1rem;
	}

	.live-demo-bar h2 {
		margin: 0;
		font-size: 1.375rem;
	}

	.live-demo-bar p {
		margin: 0.2rem 0 0;
		color: var(--ui-muted);
	}

	.live-demo-viewers {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--ui-font-mono);
		white-space: nowrap;
	}

	.dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: #ff3b30;
	}
</style>
