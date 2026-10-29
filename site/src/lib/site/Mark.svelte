<!-- The Qyro wordmark for the website: a glass lens and the name. Not shown inside the player. -->
<span class="site-mark">
	<span class="site-mark-lens" aria-hidden="true"></span>
	<span>Qyro</span>
</span>

<style>
	.site-mark {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		font-weight: 650;
		font-size: 1.05rem;
		letter-spacing: -0.02em;
	}

	.site-mark-lens {
		width: 1.15rem;
		height: 1.15rem;
		border-radius: 50%;
		background:
			radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.95) 0 12%, transparent 45%),
			linear-gradient(160deg, var(--ui-fg), color-mix(in oklab, var(--ui-fg) 55%, var(--ui-bg)));
		box-shadow:
			inset 0 0 0 1.5px color-mix(in oklab, var(--ui-bg) 40%, transparent),
			0 1px 3px rgb(0 0 0 / 0.25);
	}
</style>
