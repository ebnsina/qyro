<script lang="ts">
	import { media } from '#lib/site/media.js';
</script>

<div class="side-after cinema-info">
	<h2>Sintel</h2>
	<p>2010 · Fantasy · 15 min · {media.sintel.credit}</p>
</div>

<style>
	/* The credits sit inside the dark frame, clear of its rounded corners. */
	.cinema-info {
		padding: 1rem 1.25rem 1.25rem;
	}

	.cinema-info h2 {
		margin: 0;
		font-size: var(--type-heading);
	}

	.cinema-info p {
		margin: 0.25rem 0 0;
		opacity: 0.7;
	}
</style>
