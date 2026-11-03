<script lang="ts">
	import {
		AccessIcon,
		ClosedCaptionIcon,
		Image01Icon,
		KeyboardIcon,
		LiveStreaming02Icon,
		PlayIcon,
		SecurityCheckIcon,
		Shield01Icon,
		Tick02Icon,
	} from '@hugeicons/core-free-icons';
	import { tools } from '#lib/ai/ai.js';
	import ToolMark from '#lib/ai/ToolMark.svelte';
	import Button from '#lib/sinaui/ui/Button.svelte';
	import CodeBlock from '#lib/sinaui/ui/CodeBlock.svelte';
	import Icon from '#lib/sinaui/ui/Icon.svelte';
	import Footer from '#lib/site/Footer.svelte';
	import Header from '#lib/site/Header.svelte';
	import Seo from '#lib/site/Seo.svelte';
	import { accordion } from '#lib/site/accordion.js';
	import { file, media, to } from '#lib/site/links.js';
	import { reveal } from '#lib/site/reveal.js';

	const steps = [
		{ title: 'Add the script', text: 'Install from npm, or drop in one script tag. There is no build step to set up.', code: `npm install @ebnsina/qyro\n\nimport '@ebnsina/qyro';`, lang: 'shell' as const },
		{ title: 'Set the source', text: 'Give it an HLS, DASH, live or MP4 URL. Captions are plain track elements.', code: `<qyro-player src="/film.m3u8" title="My film">\n  <track srclang="en" label="English" src="/en.vtt" />\n</qyro-player>`, lang: 'html' as const },
		{ title: 'Make it yours', text: 'Colour, radius and glass are CSS custom properties. Change them in one place.', code: `qyro-player {\n  --qyro-accent: #ffd60a;\n  --qyro-radius: 24px;\n}`, lang: 'css' as const },
	];

	const features = [
		{ icon: PlayIcon, title: 'HLS, DASH and MP4', text: 'Adaptive quality with an Auto choice, plus MP4 files, in every modern browser.' },
		{ icon: LiveStreaming02Icon, title: 'Live, with a DVR window', text: 'Scrub back through a live stream, then jump to "Go live" with one click.' },
		{ icon: ClosedCaptionIcon, title: 'Captions and chapters', text: 'WebVTT, SRT and TTML captions, with a chapter list on the timeline.' },
		{ icon: Image01Icon, title: 'Thumbnails on seek', text: 'Storyboard previews appear on the timeline while the viewer scrubs.' },
		{ icon: KeyboardIcon, title: 'Keyboard and touch', text: 'Familiar shortcuts, double-tap to skip, a long-press menu, and 44px touch targets.' },
		{ icon: AccessIcon, title: 'Accessible by default', text: 'Labelled controls, visible focus, announced changes, and motion that respects the reduced-motion setting.' },
	];

	// One short line per coding agent; the folder and install steps come from the shared tool list.
	const blurbs: Record<string, string> = {
		claude: "Anthropic's terminal agent.",
		codex: "OpenAI's coding agent.",
		cursor: 'AI code editor.',
		copilot: 'Agent mode in your repo.',
		gemini: "Google's terminal agent.",
		windsurf: 'AI editor with Cascade.',
	};
	const agents = tools.filter((t) => t.id in blurbs);

	// What Qyro is for, and what it is not for. Stated as the maintainers' commitment, since MIT licensing can't restrict use.
	const principles = [
		{ icon: Shield01Icon, title: 'Nothing that Islam prohibits', text: 'Qyro must not be used to host, stream or promote gambling, obscene or sexual content, alcohol or drug promotion, or anything else haram.' },
		{ icon: Tick02Icon, title: 'No dark patterns', text: 'No hidden fees, no tricks to keep people watching, and no selling of viewers\' data. Clear pricing, with nothing added at checkout.' },
		{ icon: SecurityCheckIcon, title: 'No tracking by default', text: 'Analytics are off unless the site owner turns them on, and then they go to a server the owner runs.' },
	];

	const compat = [
		{ name: 'Plain HTML', text: 'One script tag, or an import in any bundler.' },
		{ name: 'React, Solid, Svelte, Lit', text: 'Use the tag as it is. No configuration.' },
		{ name: 'Vue', text: 'Mark the tag as native in your compiler options.' },
		{ name: 'Angular', text: 'Add the custom elements schema to the component.' },
		{ name: 'Next.js, Nuxt, SvelteKit, Astro', text: 'Renders on the server, plays in the browser.' },
	];
</script>

<Seo title="Qyro" description="Qyro is a beautiful video player for any website. Streaming, live, captions and accessibility work everywhere, from one HTML element." />

<Header />

<main id="main">
	<section class="hero site-wrap">
		<div class="hero-grid">
			<div class="hero-copy">
				<span class="pill">Free and open source · MIT</span>
				<h1>A video player for any website, in <span class="accent">one HTML element</span>.</h1>
				<p class="lede">
					HLS, DASH, live and MP4, with captions, chapters and thumbnails. It works with a mouse, a keyboard, a touchscreen and a
					screen reader, in every browser.
				</p>
				<div class="actions">
					<Button size="lg" href={to('/docs/getting-started')}>Get started</Button>
					<Button size="lg" variant="outline" href={to('/demo')}>See the demos</Button>
				</div>
				<p class="install-line"><code>npm install @ebnsina/qyro</code></p>
			</div>
			<div class="hero-player">
				<qyro-player src={media.bbb.hls} poster={media.bbb.poster} title={media.bbb.title} thumbnails={file(media.bbb.storyboard)} start="5" muted></qyro-player>
			</div>
		</div>
	</section>

	<section class="site-section" {@attach reveal}>
		<div class="site-wrap">
			<p class="eyebrow">How it works</p>
			<h2>From nothing to a finished player in three steps.</h2>
			<ol class="flow">
				{#each steps as step, i (step.title)}
					<li data-reveal-item style:--i={i}>
						<div>
							<span class="step-no">Step {String(i + 1).padStart(2, '0')}</span>
							<h3>{step.title}</h3>
							<p>{step.text}</p>
						</div>
						<CodeBlock code={step.code} lang={step.lang} />
					</li>
				{/each}
			</ol>
		</div>
	</section>

	<section class="site-section tint" {@attach reveal}>
		<div class="site-wrap">
			<p class="eyebrow">What viewers get</p>
			<h2>The parts people notice, and the ones they miss when they're gone.</h2>
			<ul class="features">
				{#each features as f, i (f.title)}
					<li data-reveal-item style:--i={i}>
						<span class="chip"><Icon icon={f.icon} size={20} /></span>
						<h3>{f.title}</h3>
						<p>{f.text}</p>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="site-section" {@attach reveal}>
		<div class="site-wrap">
			<p class="eyebrow">With AI</p>
			<h2>Let your coding agent set it up.</h2>
			<p class="sub">Each agent reads Qyro's skill from its own folder. Ask it to add the player, and it uses the current API.</p>
			<ul class="agents">
				{#each agents as t, i (t.id)}
					<li data-reveal-item style:--i={i}>
						<span class="mark"><ToolMark tool={t} size={20} /></span>
						<h3>{t.name}</h3>
						<p>{blurbs[t.id]}</p>
						<p class="path">Skill in <code>{t.where}</code></p>
					</li>
				{/each}
			</ul>
			<p class="foot-note">Using another agent? <a href={to('/docs/ai')}>Copy the skill or the install prompt</a>.</p>
		</div>
	</section>

	<section class="site-section tint" {@attach reveal}>
		<div class="site-wrap compat">
			<div>
				<p class="eyebrow">Compatibility</p>
				<h2>Works wherever your page does.</h2>
				<p class="sub">Qyro is a standard custom element. Importing it on the server is safe, and the player starts in the browser only.</p>
			</div>
			<div class="faq">
				{#each compat as row, i (row.name)}
					<details open={i < 2} {@attach accordion}>
						<summary>{row.name}<span class="chev" aria-hidden="true"><i></i></span></summary>
						<p>{row.text}</p>
					</details>
				{/each}
			</div>
		</div>
	</section>

	<section class="site-section" {@attach reveal}>
		<div class="site-wrap">
			<p class="eyebrow">Weight and privacy</p>
			<h2>Small on the page, and nothing is tracked unless you turn it on.</h2>
			<ul class="numbers">
				<li data-reveal-item style:--i={0}><strong>32 kB</strong><span>The player, gzipped.</span></li>
				<li data-reveal-item style:--i={1}><strong>255 kB</strong><span>The playback engine, loaded the first time a video plays.</span></li>
				<li data-reveal-item style:--i={2}><strong>0</strong><span>Trackers. Analytics stay off unless you set <code>seyr-key</code>, and then they go to your own server.</span></li>
			</ul>
		</div>
	</section>

	<section class="site-section tint" {@attach reveal}>
		<div class="site-wrap install">
			<div>
				<p class="eyebrow">Install</p>
				<h2>From npm, or one script tag.</h2>
				<p class="sub">Use the package in your bundler, or load the single file on any page.</p>
			</div>
			<div class="stack">
				<CodeBlock code={`npm install @ebnsina/qyro`} lang="shell" />
				<CodeBlock code={`<script src="https://cdn.jsdelivr.net/npm/@ebnsina/qyro@0.1.0/dist/qyro.iife.js"></${'script'}>`} lang="html" />
			</div>
		</div>
	</section>

	<section class="site-section tint" {@attach reveal}>
		<div class="site-wrap">
			<p class="eyebrow">Principles</p>
			<h2>Built to serve good use, and never to be used for harm.</h2>
			<p class="sub">Qyro is free and open source under the MIT licence. These are the commitments behind it, and a request to everyone who uses it.</p>
			<ul class="features">
				{#each principles as p, i (p.title)}
					<li data-reveal-item style:--i={i}>
						<span class="chip"><Icon icon={p.icon} size={20} /></span>
						<h3>{p.title}</h3>
						<p>{p.text}</p>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="site-section cta" {@attach reveal}>
		<div class="site-wrap">
			<h2>Ready in a minute.</h2>
			<p class="sub">Add the script, point it at a video, and it plays.</p>
			<div class="actions">
				<Button size="lg" href={to('/docs/getting-started')}>Get started</Button>
				<Button size="lg" variant="outline" href="https://github.com/ebnsina/qyro">View on GitHub</Button>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	.hero {
		min-height: calc(100svh - 4.5rem);
		display: flex;
		align-items: center;
		padding-block: 2.5rem;
	}

	.hero-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		gap: 3rem;
		align-items: center;
		width: 100%;
	}

	.hero h1 {
		margin: 1.25rem 0 0;
		font-size: clamp(2.5rem, 4.8vw, 4.25rem);
		line-height: 1;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.9rem;
		border: 1px solid var(--ui-field-line);
		border-radius: 999px;
		color: var(--ui-muted);
		font-family: var(--ui-font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.accent {
		color: var(--ui-accent);
	}

	.lede {
		margin: 0;
		max-width: 32rem;
		color: var(--ui-muted);
		font-size: clamp(1.125rem, 1.6vw, 1.3125rem);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 2rem;
	}

	.install-line {
		margin: 1.5rem 0 0;
		color: var(--ui-muted);
		font-size: 0.875rem;
	}

	.hero-player {
		border-radius: var(--ui-radius);
		overflow: hidden;
	}

	.hero-player qyro-player {
		display: block;
		width: 100%;
	}

	/* The brand pink on the hero player, as in the approved draft. */
	.hero-player qyro-player {
		--qyro-accent: var(--ui-accent);
	}

	.eyebrow {
		margin: 0 0 1rem;
		color: var(--ui-accent);
		font-family: var(--ui-font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.sub {
		margin: 1rem 0 0;
		max-width: 40rem;
		color: var(--ui-muted);
	}

	.tint {
		background: var(--site-tint);
	}

	.flow {
		display: grid;
		gap: 3.5rem;
		margin: 3.5rem 0 0;
		padding: 0;
		list-style: none;
	}

	.flow li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		gap: 2.5rem 3.5rem;
		align-items: center;
	}

	.step-no {
		color: var(--ui-accent);
		font-family: var(--ui-font-mono);
		font-size: 0.8125rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.flow h3 {
		margin: 0.75rem 0 0.5rem;
		font-size: clamp(1.5rem, 2.6vw, 1.875rem);
		line-height: 1.1;
	}

	.flow p {
		margin: 0;
		max-width: 28rem;
		color: var(--ui-muted);
	}

	.features,
	.agents,
	.numbers {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin: 3.5rem 0 0;
		padding: 0;
		list-style: none;
	}

	.features li,
	.agents li {
		display: grid;
		gap: 0.75rem;
		align-content: start;
		padding: 1.5rem;
		border-radius: var(--ui-radius);
		background: var(--ui-surface);
	}

	.agents li {
		background: var(--site-tint);
	}

	.chip,
	.mark {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: var(--ui-radius-control);
		color: var(--ui-accent);
		background: color-mix(in oklab, var(--ui-accent) 14%, transparent);
	}

	.mark {
		color: var(--ui-fg);
		background: var(--ui-subtle);
	}

	.features h3,
	.agents h3 {
		margin: 0.25rem 0 0;
		font-size: 1.375rem;
		line-height: 1.15;
	}

	.features p,
	.agents p {
		margin: 0;
		color: var(--ui-muted);
	}

	.agents .path code {
		display: block;
		margin-top: 0.25rem;
		color: var(--ui-fg);
		font-size: 0.8125rem;
	}

	.foot-note {
		margin: 1.5rem 0 0;
		color: var(--ui-muted);
	}

	.foot-note a {
		color: var(--ui-fg);
	}

	.compat {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
		gap: 3rem;
		align-items: start;
	}

	.faq details {
		padding-block: 1.25rem;
	}

	.faq details:first-child {
		padding-top: 0;
	}

	.faq summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		cursor: pointer;
		list-style: none;
		font-family: var(--site-display);
		font-size: clamp(1.25rem, 2vw, 1.5rem);
		font-weight: 600;
		line-height: 1.2;
	}

	.faq summary::-webkit-details-marker {
		display: none;
	}

	.chev {
		display: grid;
		place-items: center;
		flex: none;
		width: 2rem;
		height: 2rem;
		border-radius: var(--ui-radius-control);
		background: var(--ui-surface);
	}

	.chev i {
		position: relative;
		width: 0.75rem;
		height: 0.75rem;
		transition: transform 200ms ease;
	}

	.chev i::before,
	.chev i::after {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		width: 100%;
		height: 2px;
		background: currentColor;
		border-radius: 1px;
		transform: translateY(-50%);
	}

	.chev i::after {
		transform: translateY(-50%) rotate(90deg);
	}

	.faq details[open] .chev i {
		transform: rotate(45deg);
	}

	.faq p {
		margin: 0.75rem 0 0;
		max-width: 40rem;
		color: var(--ui-muted);
	}

	.numbers {
		margin-top: 3.5rem;
	}

	.numbers strong {
		display: block;
		font-family: var(--site-display);
		font-size: clamp(2.5rem, 5vw, 3.5rem);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.numbers span {
		display: block;
		margin-top: 0.75rem;
		color: var(--ui-muted);
	}

	.install {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
		gap: 3rem;
		align-items: start;
	}

	.stack {
		display: grid;
		gap: 1rem;
	}

	.cta {
		text-align: center;
	}

	.cta .sub {
		margin-inline: auto;
	}

	.cta .actions {
		justify-content: center;
	}

	@media (max-width: 900px) {
		.hero-grid,
		.flow li,
		.install,
		.compat {
			grid-template-columns: minmax(0, 1fr);
		}

		.features,
		.agents {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 560px) {
		.features,
		.agents,
		.numbers {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
