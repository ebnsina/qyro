<script lang="ts">
	import {
		Analytics01Icon,
		ClosedCaptionIcon,
		ColorsIcon,
		KeyboardIcon,
		LiveStreaming02Icon,
		SparklesIcon,
		Image01Icon,
		AccessIcon,
	} from '@hugeicons/core-free-icons';
	import Badge from '#lib/sinaui/ui/Badge.svelte';
	import Button from '#lib/sinaui/ui/Button.svelte';
	import CodeBlock from '#lib/sinaui/ui/CodeBlock.svelte';
	import Icon from '#lib/sinaui/ui/Icon.svelte';
	import Footer from '#lib/site/Footer.svelte';
	import Header from '#lib/site/Header.svelte';
	import Seo from '#lib/site/Seo.svelte';
		import { file, media, to } from '#lib/site/links.js';
	import { reveal } from '#lib/site/reveal.js';

	const steps = [
		{ title: 'Add the script', text: 'Install from npm, or drop in one script tag. Nothing else to set up.', code: `npm install qyro\n\nimport 'qyro';`, lang: 'shell' as const },
		{ title: 'Set the source', text: 'HLS, DASH, live or MP4. Captions are plain track elements.', code: `<qyro-player\n  src="/film.m3u8"\n  title="My film"\n  thumbnails="/film/storyboard.vtt"\n>\n  <track srclang="en" label="English" src="/en.vtt" />\n</qyro-player>`, lang: 'html' as const },
		{ title: 'Make it yours', text: 'Every color, radius and blur is a CSS custom property.', code: `qyro-player {\n  --qyro-accent: #ffd60a;\n  --qyro-radius: 24px;\n}`, lang: 'css' as const },
	];

	const features = [
		{ icon: SparklesIcon, title: 'Liquid glass', text: 'Frosted capsules with a specular rim and soft depth, readable over bright and dark frames.' },
		{ icon: LiveStreaming02Icon, title: 'HLS, DASH and live', text: 'Adaptive quality with an Auto choice, DVR seeking and a clear live badge.' },
		{ icon: ClosedCaptionIcon, title: 'Captions, done right', text: 'WebVTT, SRT, TTML and in-stream captions, with viewer styling that sticks.' },
		{ icon: Image01Icon, title: 'Thumbnails', text: 'Storyboard previews on the seek bar, from a WebVTT sprite or the stream itself.' },
		{ icon: KeyboardIcon, title: 'Keyboard and touch', text: 'YouTube-style shortcuts, double-tap to skip, long-press menu, 44px targets.' },
		{ icon: AccessIcon, title: 'Accessible', text: 'Labelled controls, announced changes, visible focus and reduced-motion fades.' },
		{ icon: ColorsIcon, title: 'Theming', text: 'Custom properties and ::part() hooks for every piece, in light or dark glass.' },
		{ icon: Analytics01Icon, title: 'Private analytics, if you want', text: 'Opt-in Seyr video analytics on your own server. No trackers, ever.' },
	];
</script>

<Seo title="Qyro" description="Qyro is a beautiful video player for any website. Streaming, live, captions and accessibility work everywhere, from one HTML element." />

<Header />

<main id="main">
	<section class="hero site-wrap">
		<Badge tone="neutral" icon={false}>Open source · MIT</Badge>
		<h1>A beautiful video player for any website.</h1>
		<p class="site-lede">
			Adaptive streaming, live, captions and thumbnails that work in every browser, on every phone, with a keyboard or a
			screen reader. One HTML element, ready in a minute.
		</p>
		<div class="hero-actions">
			<Button size="lg" href={to('/docs/getting-started')}>Get started</Button>
			<Button size="lg" variant="outline" href={to('/demo')}>See the demos</Button>
		</div>
		<div class="hero-player">
			<qyro-player src={media.bbb.hls} poster={media.bbb.poster} title={media.bbb.title} thumbnails={file(media.bbb.storyboard)} muted></qyro-player>
		</div>
	</section>

	<section class="site-section" {@attach reveal}>
		<div class="site-wrap">
			<h2>How it works</h2>
			<p class="site-lede">Three steps from nothing to a finished player. No build step needed.</p>
			<ol class="steps">
				{#each steps as step, i (step.title)}
					<li data-reveal-item style:--i={i}>
						<span class="step-n">{i + 1}</span>
						<h3>{step.title}</h3>
						<p>{step.text}</p>
						<CodeBlock code={step.code} lang={step.lang} />
					</li>
				{/each}
			</ol>
		</div>
	</section>

	<section class="site-section" {@attach reveal}>
		<div class="site-wrap">
			<h2>Everything a player needs</h2>
			<p class="site-lede">The parts people notice and the parts they only miss when they're gone.</p>
			<ul class="features">
				{#each features as f, i (f.title)}
					<li data-reveal-item style:--i={i}>
						<Icon icon={f.icon} size={22} />
						<h3>{f.title}</h3>
						<p>{f.text}</p>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="site-section" {@attach reveal}>
		<div class="site-wrap install">
			<div>
				<h2>Install</h2>
				<p class="site-lede">From npm for your bundler, or one script tag for any page.</p>
			</div>
			<div class="install-code">
				<CodeBlock code={`npm install qyro`} lang="shell" />
				<CodeBlock code={`<script src="https://cdn.jsdelivr.net/npm/qyro@0.1.0/dist/qyro.iife.js"></${"script"}>`} lang="html" />
			</div>
		</div>
	</section>

	<section class="site-section" {@attach reveal}>
		<div class="site-wrap install">
			<div>
				<h2>Works with your coding agent</h2>
				<p class="site-lede">
					Give Claude Code, Codex or any agent the Qyro skill or llms.txt, and it adds, themes and wires up the player correctly.
				</p>
				<Button variant="outline" href={to('/docs/ai')}>Use with AI</Button>
			</div>
			<CodeBlock code={`Add a Qyro video player playing /film.m3u8 with English captions\nand a storyboard. Use the Qyro skill.`} lang="shell" />
		</div>
	</section>
</main>

<Footer />

<style>
	.hero {
		display: grid;
		justify-items: center;
		text-align: center;
		padding-block: clamp(3.5rem, 9vw, 6.5rem) clamp(3rem, 7vw, 5rem);
	}

	.hero h1 {
		margin: 1.25rem 0 1rem;
		font-size: clamp(2.5rem, 7vw, 4.75rem);
		line-height: 1.02;
		letter-spacing: -0.045em;
		font-weight: 680;
		text-wrap: balance;
	}

	.hero .site-lede {
		margin-inline: auto;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
	}

	.hero-player {
		width: 100%;
		margin-top: clamp(2.5rem, 6vw, 4rem);
		filter: drop-shadow(0 30px 60px rgb(0 0 0 / 0.25));
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: 2.5rem 2rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.steps h3,
	.features h3 {
		margin: 0.75rem 0 0.35rem;
		font-size: 1.0625rem;
		font-weight: 600;
	}

	.steps p,
	.features p {
		margin: 0 0 1rem;
		color: var(--ui-muted);
	}

	.step-n {
		display: inline-grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid var(--ui-control-line);
		font-family: var(--ui-font-mono);
		font-size: 0.875rem;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 2.5rem 2rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.install {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
		gap: 2rem 3rem;
		align-items: start;
	}

	.install-code {
		display: grid;
		gap: 1rem;
	}

	@media (max-width: 800px) {
		.install {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
