<script lang="ts">
	import CodeBlock from '#lib/sinaui/ui/CodeBlock.svelte';
	import Footer from '#lib/site/Footer.svelte';
	import Header from '#lib/site/Header.svelte';
	import Seo from '#lib/site/Seo.svelte';
	import { templates } from '#lib/demo/templates.js';
	import { to } from '#lib/site/links.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const t = $derived(templates[data.index]);
	const prev = $derived(templates[data.index - 1]);
	const next = $derived(templates[data.index + 1]);
</script>

<Seo title={`${t.title} demo`} description={t.description} />

<Header />
<main id="main" class="site-wrap demo-page">
	<p class="crumb"><a href={to('/demo')}>Demo</a> / {t.title}</p>
	<h1>{t.title}</h1>
	<p class="site-lede">{t.description}</p>
	{#key t.slug}
		<div class="demo-stage"><t.component /></div>
	{/key}
	<h2>The markup</h2>
	<CodeBlock code={t.code} lang={t.slug == 'theming' ? 'css' : 'html'} />
	<nav class="demo-pager" aria-label="More demos">
		{#if prev}<a href={to(`/demo/${prev.slug}`)}>← {prev.title}</a>{:else}<span></span>{/if}
		{#if next}<a href={to(`/demo/${next.slug}`)}>{next.title} →</a>{/if}
	</nav>
</main>
<Footer />

<style>
	.demo-page {
		padding-block: 2rem 5rem;
	}

	.crumb {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}

	.crumb a {
		color: inherit;
	}

	h1 {
		margin: 0.5rem 0 0.5rem;
		font-size: clamp(2rem, 4.5vw, 3rem);
		letter-spacing: -0.04em;
	}

	.demo-stage {
		margin-bottom: 3rem;
	}

	h2 {
		font-size: 1.25rem;
		margin: 0 0 1rem;
	}

	.demo-pager {
		display: flex;
		justify-content: space-between;
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--ui-line);
	}

	.demo-pager a {
		text-decoration: none;
		font-weight: 550;
	}
</style>
