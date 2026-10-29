<script lang="ts">
	import CodeBlock from '#lib/sinaui/ui/CodeBlock.svelte';
	import Seo from '#lib/site/Seo.svelte';
	import ThemePreview from '#lib/docs/ThemePreview.svelte';
	import AiGuide from '#lib/ai/AiGuide.svelte';
	import { blocks } from '#lib/docs/markdown.js';
	import { pages } from '#lib/docs/pages.js';
	import { to } from '#lib/site/links.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const parts = $derived(blocks(data.page.body));
	const i = $derived(pages.findIndex((p) => p.slug == data.page.slug));
	const prev = $derived(pages[i - 1]);
	const next = $derived(pages[i + 1]);
</script>

<Seo title={data.page.title} description={data.page.description} />

<article class="site-prose">
	{#each parts as part, n (n)}
		{#if part.kind == 'html'}
			<!-- Our own Markdown from src/docs, rendered at build time. -->
			{@html part.html}
		{:else if part.kind == 'code'}
			<CodeBlock code={part.code} lang={part.lang} />
		{:else if part.name == 'theming'}
			<ThemePreview />
		{:else if part.name == 'tools' || part.name == 'prompts'}
			<AiGuide show={part.name} />
		{/if}
	{/each}

	<nav class="docs-pager" aria-label="More docs">
		{#if prev}<a href={to(`/docs/${prev.slug}`)}><span>Previous</span>{prev.title}</a>{:else}<span></span>{/if}
		{#if next}<a class="next" href={to(`/docs/${next.slug}`)}><span>Next</span>{next.title}</a>{/if}
	</nav>
	<p class="docs-md"><a href={to(`/docs/${data.page.slug}.md`)}>This page as Markdown</a></p>
</article>

<style>
	.docs-pager {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 4rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--ui-line);
	}

	.docs-pager a {
		display: grid;
		gap: 0.15rem;
		text-decoration: none;
		font-weight: 550;
	}

	.docs-pager span {
		color: var(--ui-muted);
		font-size: 0.8125rem;
		font-weight: 400;
	}

	.docs-pager .next {
		text-align: right;
	}

	.docs-md {
		font-size: 0.875rem;
		color: var(--ui-muted);
	}
</style>
