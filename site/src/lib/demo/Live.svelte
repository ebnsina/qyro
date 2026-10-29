<script lang="ts">
	import { media } from '#lib/site/media.js';

	// A made-up audience number that drifts like a real one; a real site reads it from its server.
	let viewers = $state(1284);
	$effect(() => {
		const t = setInterval(() => (viewers = Math.max(900, viewers + Math.round((Math.random() - 0.45) * 12))), 3000);
		return () => clearInterval(t);
	});
	const count = $derived(new Intl.NumberFormat('en-US').format(viewers));
</script>

<div class="side-after live-bar">
	<div>
		<h2>Opening keynote</h2>
		<p>{media.live.credit}</p>
	</div>
	<p class="viewers"><span class="dot" aria-hidden="true"></span>{count} watching</p>
</div>

<style>
	.live-bar {
		display: flex;
		justify-content: space-between;
		align-items: start;
		gap: 1rem;
	}

	h2 {
		margin: 0;
		font-size: 1.375rem;
	}

	p {
		margin: 0.2rem 0 0;
		color: var(--ui-muted);
	}

	.viewers {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--ui-font-mono);
		white-space: nowrap;
		color: var(--ui-fg);
	}

	.dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: #ff3b30;
	}
</style>
