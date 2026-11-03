<script lang="ts">
	import { page } from '$app/state';
	import Button from '#lib/sinaui/ui/Button.svelte';
	import Footer from '#lib/site/Footer.svelte';
	import Header from '#lib/site/Header.svelte';
	import Seo from '#lib/site/Seo.svelte';
	import { GITHUB, to } from '#lib/site/links.js';

	const notFound = $derived(page.status == 404);
	const title = $derived(notFound ? 'Page not found' : 'Something went wrong');
	const description = $derived(
		notFound
			? 'This page does not exist or has moved. Start again from the Qyro home page, the docs or the demo.'
			: 'Qyro hit a problem loading this page. Try again in a moment, or report it on GitHub.'
	);
</script>

<Seo {title} {description} />
<svelte:head><meta name="robots" content="noindex" /></svelte:head>

<Header />

<main id="main" class="page site-wrap error">
	<p class="site-label eyebrow">{page.status}</p>
	<h1>{notFound ? "This page doesn't exist." : 'Something went wrong on our side.'}</h1>
	<p class="site-lede">
		{#if notFound}
			The address may be mistyped, or the page may have moved. The docs and the demo are a good place to start.
		{:else}
			It is not your fault. Try again in a moment. If it keeps happening, <a href={`${GITHUB}/issues`}>report it on GitHub</a>.
		{/if}
	</p>
	<div class="actions">
		{#if notFound}
			<Button size="lg" href={to('/')}>Back to home</Button>
			<Button size="lg" variant="outline" href={to('/docs/getting-started')}>Read the docs</Button>
		{:else}
			<Button size="lg" onclick={() => location.reload()}>Try again</Button>
			<Button size="lg" variant="outline" href={to('/')}>Back to home</Button>
		{/if}
	</div>
</main>

<Footer />

<style>
	.error {
		display: grid;
		justify-items: center;
		gap: 1rem;
		padding-block: clamp(4rem, 14vh, 8rem);
		text-align: center;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
		margin-top: 1rem;
	}
</style>
