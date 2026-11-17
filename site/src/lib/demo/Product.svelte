<script lang="ts">
	import Button from '#lib/sinaui/ui/Button.svelte';
	const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(29);
</script>

<div class="side-aside product">
	<p class="kicker">Plush toy</p>
	<h2>Buck, the big bunny</h2>
	<p class="price">{price}</p>
	<p>Soft, friendly and very large. Watch him in the meadow, then take him home.</p>
	<Button size="lg">Add to cart</Button>
</div>

<style>
	h2 {
		margin: 0.25rem 0;
		font-size: var(--type-heading);
	}

	.kicker {
		margin: 0;
		color: var(--ui-muted);
	}

	.price {
		font-family: var(--ui-font-mono);
		font-size: var(--type-subheading);
		margin: 0.25rem 0 1rem;
	}
</style>
