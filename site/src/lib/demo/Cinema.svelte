<script lang="ts">
	import { media } from '#lib/site/links.js';
</script>

<div class="cinema">
	<qyro-player src={media.sintel.hls} title={media.sintel.title} style="--qyro-radius: 0; --qyro-aspect-ratio: 21 / 9"></qyro-player>
	<div class="cinema-info">
		<h2>Sintel</h2>
		<p>2010 · Fantasy · 15 min · {media.sintel.credit}</p>
	</div>
</div>

<style>
	.cinema {
		margin-inline: calc(50% - 50vw);
		padding: clamp(1rem, 4vw, 3rem) 0 2.5rem;
		background: #050506;
		color: #eee;
	}

	.cinema-info {
		width: min(100% - 2rem, 72rem);
		margin: 1.5rem auto 0;
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
