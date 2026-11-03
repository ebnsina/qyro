<script lang="ts">
	import { media } from '#lib/site/media.js';
</script>

<div class="side-after cinema-info">
	<h2>Sintel</h2>
	<p>2010 · Fantasy · 15 min · {media.sintel.credit}</p>
</div>

<style>
	/* Under the player, on the page, as video sites show a title: the film's shape needs no band around it. */
	.cinema-info {
		margin-block-start: 1rem;
	}

	.cinema-info h2 {
		margin: 0;
		font-size: var(--type-heading);
	}

	.cinema-info p {
		margin: 0.25rem 0 0;
		color: var(--ui-muted);
	}
</style>
