<script lang="ts">
	import Button from '#lib/sinaui/ui/Button.svelte';
	import { media } from '#lib/site/links.js';
	const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(29);
</script>

<div class="product">
	<qyro-player src={media.bbb.hls} poster={media.bbb.poster} title="See it in action" muted loop start="95"></qyro-player>
	<div>
		<p class="product-kicker">Plush toy</p>
		<h2>Buck, the big bunny</h2>
		<p class="product-price">{price}</p>
		<p>Soft, friendly and very large. Watch him in the meadow, then take him home.</p>
		<Button size="lg">Add to cart</Button>
	</div>
</div>

<style>
	.product {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 2.5rem;
		align-items: center;
	}

	.product h2 {
		margin: 0.25rem 0;
		font-size: 2rem;
		letter-spacing: -0.03em;
	}

	.product-kicker {
		margin: 0;
		color: var(--ui-muted);
	}

	.product-price {
		font-family: var(--ui-font-mono);
		font-size: 1.25rem;
		margin: 0.25rem 0 1rem;
	}

	@media (max-width: 760px) {
		.product {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
