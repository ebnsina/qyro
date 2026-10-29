<script lang="ts">
	import { media } from '#lib/site/links.js';
</script>

<article class="article">
	<p class="article-kicker">Film · 6 min read</p>
	<h2>How a tiny studio made a film the whole internet could share</h2>
	<p>
		In 2010 a small team in Amsterdam set out to make a fantasy short with free software only. They released everything they
		made: the film, the models, the source files. Anyone can remix it.
	</p>
	<figure>
		<qyro-player src={media.sintel.hls} title="Sintel, the trailer moment" start="20"></qyro-player>
		<figcaption>{media.sintel.credit}</figcaption>
	</figure>
	<p>
		The result became a test film for players, encoders and browsers everywhere. When a video player needs to prove itself, it
		often plays Sintel.
	</p>
</article>

<style>
	.article {
		max-width: 65ch;
		margin-inline: auto;
		font-size: 1.0625rem;
	}

	.article-kicker {
		color: var(--ui-muted);
		font-size: 0.875rem;
		margin: 0;
	}

	.article h2 {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		line-height: 1.15;
		letter-spacing: -0.03em;
		margin: 0.5rem 0 1rem;
	}

	figure {
		margin: 2rem 0;
	}

	figcaption {
		margin-top: 0.5rem;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}
</style>
