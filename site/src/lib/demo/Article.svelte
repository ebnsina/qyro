<script lang="ts">
	import { media } from '#lib/site/media.js';
</script>

<div class="side-before article-top">
	<p class="kicker">Film · 6 min read</p>
	<h2>How a tiny studio made a film the whole internet could share</h2>
	<p>In 2010 a small team in Amsterdam set out to make a fantasy short with free software only, and released everything they made.</p>
</div>
<div class="side-after article-bottom">
	<p class="caption">{media.sintel.credit}</p>
	<p>The result became a test film for players, encoders and browsers everywhere. When a video player needs to prove itself, it often plays Sintel.</p>
</div>

<style>
	.kicker,
	.caption {
		margin: 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}

	h2 {
		margin: 0.5rem 0 0.75rem;
		font-size: clamp(1.5rem, 4cqi, 2.25rem);
		line-height: 1.15;
		letter-spacing: -0.03em;
	}

	p {
		margin: 0 0 0.5rem;
	}
</style>
