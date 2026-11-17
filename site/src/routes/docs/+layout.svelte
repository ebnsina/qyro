<script lang="ts">
	import { page } from '$app/state';
	import Header from '#lib/site/Header.svelte';
	import Footer from '#lib/site/Footer.svelte';
	import { sections, page as find } from '#lib/docs/pages.js';
	import { to } from '#lib/site/links.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	const current = $derived(page.params.slug);
</script>

<Header />
<div class="site-wrap docs">
	<nav class="docs-nav" aria-label="Docs">
		{#each sections as s (s.title)}
			<h2 class="site-label">{s.title}</h2>
			<ul>
				{#each s.slugs as slug (slug)}
					<li><a href={to(`/docs/${slug}`)} aria-current={slug == current ? 'page' : undefined}>{find(slug)?.title}</a></li>
				{/each}
			</ul>
		{/each}
	</nav>
	<main id="main" class="docs-main">
		{@render children()}
	</main>
</div>
<Footer />

<style>
	.docs {
		display: grid;
		grid-template-columns: 13rem minmax(0, 1fr);
		gap: clamp(2rem, 5vw, 4rem);
		padding-block: 2.5rem 5rem;
	}

	.docs-nav {
		position: sticky;
		top: 5rem;
		align-self: start;
		max-height: calc(100vh - 6rem);
		overflow-y: auto;
		font-size: var(--type-ui);
	}

	.docs-nav h2 {
		margin: 1.25rem 0 0.4rem;
		color: var(--ui-muted);
	}

	.docs-nav h2:first-child {
		margin-top: 0;
	}

	.docs-nav ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.docs-nav a {
		display: block;
		padding: 0.3rem 0.6rem;
		margin-left: -0.6rem;
		border-radius: var(--ui-radius-control);
		color: var(--ui-muted);
		text-decoration: none;
	}

	.docs-nav a:hover {
		color: var(--ui-fg);
	}

	.docs-nav a[aria-current='page'] {
		color: var(--ui-fg);
		background: var(--ui-subtle);
		font-weight: 600;
	}

	@media (max-width: 800px) {
		.docs {
			grid-template-columns: minmax(0, 1fr);
			padding-top: 1.25rem;
		}

		.docs-nav {
			position: static;
			max-height: none;
			display: flex;
			gap: 0.5rem 1.5rem;
			flex-wrap: wrap;
			padding-bottom: 1rem;
			border-bottom: 1px solid var(--ui-line);
		}

		.docs-nav h2 {
			display: none;
		}

		.docs-nav ul {
			display: contents;
		}

		.docs-nav li {
			flex: none;
		}
	}
</style>
