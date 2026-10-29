<script lang="ts">
	import Footer from '#lib/site/Footer.svelte';
	import Header from '#lib/site/Header.svelte';
	import Seo from '#lib/site/Seo.svelte';
	import Playground from '#lib/demo/Playground.svelte';
</script>

<Seo title="Demo" description="Try Qyro live: switch layouts, sources and attributes, theme it, watch its events, and copy the exact code for HTML, JavaScript, Svelte, React or Vue." />

<Header />
<main id="main" class="site-wrap demo">
	<h1>Demo</h1>
	<Playground />
</main>
<Footer />

<style>
	.demo {
		padding-block: 1.5rem 5rem;
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		letter-spacing: -0.04em;
	}
</style>
