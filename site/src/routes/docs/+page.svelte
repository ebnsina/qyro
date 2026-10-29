<script lang="ts">
	import Seo from '#lib/site/Seo.svelte';
	import { sections, page } from '#lib/docs/pages.js';
	import { to } from '#lib/site/links.js';
</script>

<Seo title="Docs" description="Everything about Qyro: install, attributes, API, theming, captions, thumbnails, live and analytics." />

<div class="site-prose">
	<h1>Docs</h1>
	{#each sections as s (s.title)}
		<h2>{s.title}</h2>
		<ul>
			{#each s.slugs as slug (slug)}
				{@const p = page(slug)!}
				<li><a href={to(`/docs/${slug}`)}>{p.title}</a>: {p.description}</li>
			{/each}
		</ul>
	{/each}
</div>
