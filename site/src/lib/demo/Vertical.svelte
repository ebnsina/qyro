<script lang="ts">
	import Player from './Player.svelte';
</script>

<div class="vertical">
	<Player style="--qyro-aspect-ratio: 9 / 16" />
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
