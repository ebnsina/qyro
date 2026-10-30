<script lang="ts">
	import Player from './Player.svelte';
	import { media } from '#lib/site/media.js';
</script>

<div class="cinema">
	<Player style="--qyro-radius: 0; --qyro-aspect-ratio: 21 / 9" />
	<div class="cinema-info">
		<h2>Sintel</h2>
		<p>2010 · Fantasy · 15 min · {media.sintel.credit}</p>
	</div>
</div>

<style>
	.cinema {
		padding: 1.5rem 0 2rem;
		background: #050506;
		color: #eee;
	}

	.cinema-info {
		padding: 1.25rem 1.25rem 0;
	}

	.cinema-info h2 {
		margin: 0;
		font-size: 1.75rem;
		letter-spacing: -0.02em;
	}

	.cinema-info p {
		margin: 0.25rem 0 0;
		color: #9a9a9a;
	}
</style>
