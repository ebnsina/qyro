<script lang="ts">
	import Button from '#lib/sinaui/ui/Button.svelte';
	import Player from './Player.svelte';
	const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(29);
</script>

<div class="product">
	<Player extra={{ title: 'See it in action' }} />
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

	@container frame (max-width: 640px) {
		.product {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
