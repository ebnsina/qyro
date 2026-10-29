<script lang="ts">
	import Footer from '#lib/site/Footer.svelte';
	import Header from '#lib/site/Header.svelte';
	import Seo from '#lib/site/Seo.svelte';
	import { templates } from '#lib/demo/templates.js';
	import { to } from '#lib/site/links.js';
	import { reveal } from '#lib/site/reveal.js';
</script>

<Seo title="Demo" description="Qyro in real layouts: a plain embed, cinema, a marketing hero, a course, an article, a product page, live, vertical, a playlist and a theming playground." />

<Header />
<main id="main" class="site-wrap demo-index">
	<h1>Demo</h1>
	<p class="site-lede">Qyro in the kinds of pages people build. Each one works with a mouse, a keyboard and touch, and comes with the markup to copy.</p>
	<ol class="demo-list" {@attach reveal}>
		{#each templates as t, i (t.slug)}
			<li data-reveal-item style:--i={i}>
				<a href={to(`/demo/${t.slug}`)}>
					<span class="n">{String(i + 1).padStart(2, '0')}</span>
					<span class="t">{t.title}</span>
					<span class="d">{t.description}</span>
				</a>
			</li>
		{/each}
	</ol>
</main>
<Footer />

<style>
	.demo-index {
		padding-block: 3rem 5rem;
	}

	h1 {
		margin: 0 0 0.75rem;
		font-size: clamp(2.25rem, 5vw, 3.25rem);
		letter-spacing: -0.04em;
	}

	.demo-list {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--ui-line);
	}

	.demo-list li {
		border-bottom: 1px solid var(--ui-line);
	}

	.demo-list a {
		display: grid;
		grid-template-columns: 3rem 14rem minmax(0, 1fr);
		gap: 1rem;
		align-items: baseline;
		padding: 1.25rem 0.25rem;
		text-decoration: none;
	}

	.demo-list a:hover .t {
		text-decoration: underline;
	}

	.n {
		font-family: var(--ui-font-mono);
		color: var(--ui-muted);
		font-size: 0.875rem;
	}

	.t {
		font-weight: 600;
		font-size: 1.125rem;
	}

	.d {
		color: var(--ui-muted);
	}

	@media (max-width: 640px) {
		.demo-list a {
			grid-template-columns: 2.25rem minmax(0, 1fr);
		}

		.d {
			grid-column: 2;
		}
	}
</style>
