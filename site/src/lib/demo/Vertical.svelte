<script lang="ts">
	import { media } from '#lib/site/links.js';
</script>

<div class="vertical">
	<qyro-player src={media.bbb.hls} poster={media.bbb.poster} title="A minute in the meadow" start="95" loop style="--qyro-aspect-ratio: 9 / 16; --qyro-radius: 24px"></qyro-player>
	<p>Short-form, 9:16. The controls reflow for a narrow player; double-tap the sides to skip.</p>
</div>

<style>
	.vertical {
		width: min(100%, 24rem);
		margin-inline: auto;
	}

	.vertical :global(qyro-player::part(video)) {
		object-fit: cover;
	}

	.vertical p {
		color: var(--ui-muted);
		text-align: center;
	}
</style>
