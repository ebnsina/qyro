<script lang="ts">
	import Footer from '#lib/site/Footer.svelte';
	import Header from '#lib/site/Header.svelte';
	import Seo from '#lib/site/Seo.svelte';
	import { to } from '#lib/site/links.js';

	const forUse = [
		'Teaching and courses that people sign up to learn from',
		'News, documentaries and explainers that inform',
		'Product demos, support videos and manuals',
		'Charities, mosques and community groups sharing their work',
		'Businesses that sell halal goods and services',
	];
	const notForUse = [
		'Gambling and betting, including streams that promote them',
		'Pornography and sexual content',
		'Promotion of alcohol and tobacco',
		'Adverts for interest-based lending, including predatory credit',
		'Music and content that Islam prohibits, promoted or sold through the player',
	];
	const viewers = [
		'No adverts are injected into a video. The owner decides what plays.',
		'No hidden fees, and nothing added at checkout.',
		'No dark patterns: no fake countdowns, no autoplay traps, no buttons that look like something else.',
		'Controls work with a mouse, a keyboard, a touchscreen and a screen reader.',
		'No tracking by default. Analytics are off until the site owner turns them on, and then the data stays on a server they run.',
	];
</script>

<Seo title="Ethos" description="What Qyro is for, what it must never be used for, and how the player treats the people who watch." />

<Header />

<main id="main" class="page site-wrap">
	<p class="site-label eyebrow">Ethos</p>
	<h1>Built for good video.</h1>
	<p class="site-lede">
		Qyro is a player. What a site shows through it is the site owner's choice, but the player itself should never help with what Islam
		prohibits, and it should treat every viewer fairly.
	</p>

	<h2>What it is for</h2>
	<ul>
		{#each forUse as item (item)}<li>{item}</li>{/each}
	</ul>

	<h2>What it must not be used for</h2>
	<p>We don't build features for these, and our demos and templates never show them.</p>
	<ul>
		{#each notForUse as item (item)}<li>{item}</li>{/each}
	</ul>

	<h2>How the player treats viewers</h2>
	<ul>
		{#each viewers as item (item)}<li>{item}</li>{/each}
	</ul>

	<h2>What we do when something goes wrong</h2>
	<p>
		If you see Qyro used for something on the list above, or a feature that works against viewers, report it in the
		<a href="https://github.com/ebnsina/qyro/issues">issue tracker</a>. We'll say publicly what we're doing about it, and we'll remove any demo or
		template that conflicts with these principles.
	</p>

	<h2>The basis</h2>
	<p>
		We draw on the Qur'an, 5:2: cooperate in righteousness and piety, not in sin and transgression. We are not scholars. When we are unsure
		whether something fits, we ask qualified people before we decide.
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
	}

	h1 {
		margin: 0;
	}

	.site-lede {
		margin: 1.25rem 0 0;
		color: var(--ui-muted);
	}

	h2 {
		margin: 3rem 0 0.75rem;
	}

	p {
		margin: 0.75rem 0 0;
		max-width: var(--site-measure);
	}

	ul {
		margin: 0;
		padding-left: 1.25rem;
		max-width: var(--site-measure);
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
