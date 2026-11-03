<script lang="ts">
	import Footer from '#lib/site/Footer.svelte';
	import Header from '#lib/site/Header.svelte';
	import Seo from '#lib/site/Seo.svelte';
	import { to } from '#lib/site/links.js';

	const takes = [
		'Trade, operations and logistics',
		'Health, education and public services',
		'Interest-free finance',
		'Charities and community organisations',
		'Anything the client would be comfortable explaining to their family',
	];
	const declines = [
		'Adult content',
		'Gambling and betting',
		'Interest-based lending, including buy-now-pay-later and predatory short-term credit',
		'Alcohol and tobacco',
		'Dark patterns: hidden charges, hard-to-cancel subscriptions',
		'Fake reviews, endorsements, or impersonation',
	];
	const screening = [
		'The client describes what the product does and who pays for it.',
		'We answer within a working day, with reasons, and a referral if we decline.',
		'Scope and standards go into the contract.',
		'The standard still applies if the project changes direction. We flag problems early and hand over cleanly.',
	];
</script>

<Seo title="Ethos" description="How Qyro decides what it is used for: the work it takes on, the work it turns down, and why." />

<Header />

<main id="main" class="page site-wrap">
	<p class="eyebrow">Ethos</p>
	<h1>Halal by design.</h1>
	<p class="lede">
		Ethics come before budget or brief. Clients don't need to share these beliefs to work with us, but the standard applies to every project.
	</p>

	<h2>Work we take on</h2>
	<ul>
		{#each takes as item (item)}<li>{item}</li>{/each}
	</ul>

	<h2>Work we turn down</h2>
	<ul>
		{#each declines as item (item)}<li>{item}</li>{/each}
	</ul>

	<h2>How we screen a project</h2>
	<ol>
		{#each screening as item (item)}<li>{item}</li>{/each}
	</ol>

	<h2>The basis</h2>
	<p>
		We draw on the Qur'an, 5:2, on cooperating in righteousness rather than in sin, and on a hadith on interest, which names the scribe and
		the witnesses as well as the parties. We see ourselves as the scribe: we write the terms down clearly and make sure both sides can read them.
	</p>
	<p>
		We are not a group of scholars, and this page is not a fatwa. When we are unsure, we consult qualified people.
	</p>

	<h2>If we would rather not</h2>
	<p>
		We would rather lose a project than take one we are uneasy about. If you want to talk about a project, write to
		<a href="mailto:salam@fajrlabs.io">salam@fajrlabs.io</a>.
	</p>

	<p class="back"><a href={to('/')}>Back to the home page</a></p>
</main>

<Footer />

<style>
	.page {
		max-width: 46rem;
		padding-block: clamp(3rem, 8vw, 5.5rem);
	}

	.eyebrow {
		margin: 0 0 1rem;
		color: var(--ui-accent);
		font-family: var(--ui-font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0;
		font-size: clamp(2.25rem, 5vw, 3.25rem);
		line-height: 1.08;
		letter-spacing: -0.01em;
	}

	.lede {
		margin: 1.25rem 0 0;
		color: var(--ui-muted);
		font-size: 1.1875rem;
	}

	h2 {
		margin: 3rem 0 0.75rem;
		font-size: 1.75rem;
		line-height: 1.15;
		letter-spacing: -0.005em;
	}

	p,
	li {
		font-size: 1.0625rem;
		line-height: 1.7;
	}

	p {
		margin: 0.75rem 0 0;
	}

	ul,
	ol {
		margin: 0;
		padding-left: 1.25rem;
	}

	li + li {
		margin-top: 0.5rem;
	}

	.back {
		margin-top: 3.5rem;
	}

	a {
		color: var(--ui-fg);
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}
</style>
