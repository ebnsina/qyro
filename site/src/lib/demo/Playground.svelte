<script lang="ts">
	import { onMount, setContext, untrack } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Delete02Icon } from '@hugeicons/core-free-icons';
	import CodeBlock from '#lib/sinaui/ui/CodeBlock.svelte';
	import Icon from '#lib/sinaui/ui/Icon.svelte';
	import Input from '#lib/sinaui/ui/Input.svelte';
	import Segmented from '#lib/sinaui/ui/Segmented.svelte';
	import Select from '#lib/sinaui/ui/Select.svelte';
	import Switch from '#lib/sinaui/ui/Switch.svelte';
	import * as Tabs from '#lib/sinaui/ui/tabs/index.js';
	import { media } from '#lib/site/links.js';
	import { isDark } from '#lib/sinaui/ui/theme.js';
	import ThemeControls from './ThemeControls.svelte';
	import { snippet, TABS, type Tab } from './code.js';
	import { CAPTIONS, chaptersOf, initial, parse, playerAttrs, serialize, sourceOf, sources, styleOf, themeVars, type Settings, type State } from './state.js';
	import { templates } from './templates.js';
	import type { PlaygroundContext, PlayerEl } from './context.js';
	import { SITE_URL, file } from '#lib/site/links.js';

	const slugs = templates.map((t) => t.slug);
	let s = $state<State>(initial());
	let ready = $state(false);
	let player = $state<PlayerEl>();
	const template = $derived(templates.find((t) => t.slug == s.t) ?? templates[0]);
	const attrs = $derived({ ...playerAttrs(s, file), ...(template.player ?? {}) });

	setContext<PlaygroundContext>('playground', {
		get state() {
			return s;
		},
		get player() {
			return player;
		},
		set(p: Partial<Settings>) {
			Object.assign(s, p);
		},
	});

	// ---------- URL: the whole state is shareable, and back/forward walks through it ----------

	let shown = { t: '', source: '' };
	onMount(() => {
		s = parse(location.search, slugs);
		shown = { t: s.t, source: s.source };
		scheme = isDark() ? 'dark' : 'light';
		ready = true;
	});

	$effect(() => {
		const q = serialize(s);
		if (!ready) return;
		untrack(() => {
			if (q == location.search) return;
			// A new template or video is a step back can return to; tweaks replace the current entry.
			const step = s.t != shown.t || s.source != shown.source;
			shown = { t: s.t, source: s.source };
			void goto(q, { shallow: true, state: {}, replace: !step });
		});
	});

	$effect(() => {
		void page.url.href;
		if (!ready) return;
		untrack(() => {
			if (location.search && location.search != serialize(s)) {
				s = parse(location.search, slugs);
				shown = { t: s.t, source: s.source };
			}
		});
	});

	// The same player stays; only its settings and the layout around it change, with a soft cross-fade.
	function pick(slug: string) {
		if (slug == s.t) return;
		const apply = () => (s = { ...initial(slug), theme: s.theme });
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (document.startViewTransition && !still) document.startViewTransition(apply);
		else apply();
	}

	// ---------- Preview frame: device presets, a drag handle, light or dark ----------

	const PRESETS = { desktop: 0, tablet: 768, phone: 375 } as const;
	let device = $state<keyof typeof PRESETS | 'custom'>('desktop');
	let width = $state(0);
	let scheme = $state<'light' | 'dark'>('light');
	let stage = $state<HTMLElement>();
	let frame = $state<HTMLElement>();
	const frameWidth = $derived(device == 'desktop' ? '100%' : `min(${device == 'custom' ? width : PRESETS[device]}px, 100%)`);

	function drag(e: PointerEvent) {
		const handle = e.currentTarget as HTMLElement;
		handle.setPointerCapture(e.pointerId);
		const left = stage!.getBoundingClientRect().left;
		const move = (ev: PointerEvent) => {
			device = 'custom';
			width = Math.round(Math.max(280, Math.min(ev.clientX - left, stage!.clientWidth)));
		};
		const up = () => {
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('pointerup', up);
		};
		handle.addEventListener('pointermove', move);
		handle.addEventListener('pointerup', up);
	}

	function nudge(e: KeyboardEvent) {
		const step = { ArrowLeft: -20, ArrowRight: 20 }[e.key];
		if (!step) return;
		e.preventDefault();
		device = 'custom';
		width = Math.max(280, Math.min((frame?.offsetWidth ?? 0) + step, stage!.clientWidth));
	}

	// ---------- Events log: what the player fires, as it fires ----------

	const EVENTS = ['loadedmetadata', 'play', 'playing', 'pause', 'waiting', 'seeking', 'seeked', 'ended', 'ratechange', 'volumechange', 'qualitychange', 'chapterchange', 'error', 'enterpictureinpicture', 'leavepictureinpicture'];
	let log = $state<{ id: number; at: string; name: string; detail: string }[]>([]);
	let seq = 0;
	// Times count from the first event, not the playhead: live streams sit on a clock decades long.
	let since = 0;

	function elapsed(): string {
		const now = performance.now();
		if (!log.length) since = now;
		const s = (now - since) / 1000;
		return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
	}

	function describe(e: Event): string {
		const p = e.target as PlayerEl & { volume: number; playbackRate: number };
		const d = (e as CustomEvent).detail;
		if (e.type == 'qualitychange') return `${d.height}p · ${(d.bitrate / 1e6).toFixed(2)} Mbps${d.auto ? ' · Auto' : ''}`;
		if (e.type == 'chapterchange') return d.chapter?.title ?? 'between chapters';
		if (e.type == 'error') return `${d?.kind ?? 'unknown'}${d?.code ? ` · code ${d.code}` : ''}`;
		if (e.type == 'volumechange') return p.muted ? 'muted' : `volume ${Math.round(p.volume * 100)}%`;
		if (e.type == 'ratechange') return `speed ${p.playbackRate}×`;
		return '';
	}

	$effect(() => {
		const p = player;
		if (!p) return;
		const on = (e: Event) => {
			log = [{ id: ++seq, at: elapsed(), name: e.type, detail: describe(e) }, ...log].slice(0, 60);
		};
		for (const name of EVENTS) p.addEventListener(name, on);
		return () => EVENTS.forEach((name) => p.removeEventListener(name, on));
	});

	// ---------- Code ----------

	let tab = $state<Tab>('html');
	const code = $derived(snippet(s, tab, SITE_URL));
	const hasStoryboard = $derived(!!sourceOf(s).storyboard);
	let draftUrl = $state('');
	const codeLang = (t: Tab) => (t == 'html' || t == 'vue' ? 'html' : t == 'svelte' ? 'svelte' : t == 'react' ? 'ts' : 'js');
</script>

<div class="pg">
	<div class="pg-tabs">
		<!-- Clicks and arrow keys both choose a tab; the template follows through the setter. -->
		<Tabs.Root bind:value={() => s.t, (v) => v && pick(v)} variant="line">
			<Tabs.List label="Template">
				{#each templates as t (t.slug)}
					<Tabs.Tab value={t.slug} aria-controls="pg-stage">
						<span class="pg-tab"><Icon icon={t.icon} size={16} />{t.title}</span>
					</Tabs.Tab>
				{/each}
			</Tabs.List>
		</Tabs.Root>
	</div>

	<div class="pg-stage" id="pg-stage" role="region" aria-label="{template.title} preview" bind:this={stage}>
		<div class="pg-frame" data-scheme={scheme} style:width={frameWidth} style={styleOf(themeVars(s.theme))} bind:this={frame}>
			<div class="pg-layout" data-t={s.t}>
				<div class="pg-player">
					<qyro-player bind:this={player} {...attrs}>
						{#if s.captions}<track kind="subtitles" srclang="en" label="English" src={file(CAPTIONS)} default />{/if}
						{#if chaptersOf(s)}<track kind="chapters" src={file(chaptersOf(s)!)} />{/if}
					</qyro-player>
				</div>
				{#if template.side}
					<div class="pg-side"><template.side /></div>
				{/if}
			</div>
		</div>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
		<div class="pg-handle" role="separator" aria-orientation="vertical" aria-label="Preview width" tabindex="0" onpointerdown={drag} onkeydown={nudge}></div>
	</div>

	<div class="pg-toolbar">
		<p class="pg-desc">{template.description}</p>
		<div class="pg-toolbar-end">
			<Segmented
				label="Preview width"
				hideLabel
				options={[
					{ value: 'desktop', label: 'Desktop' },
					{ value: 'tablet', label: 'Tablet' },
					{ value: 'phone', label: 'Phone' },
					...(device == 'custom' ? [{ value: 'custom', label: `${width}px` }] : []),
				]}
				bind:value={device as string}
			/>
			<Segmented label="Preview theme" hideLabel options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} bind:value={scheme as string} />
		</div>
	</div>

	<div class="pg-below">
		<aside class="pg-controls" aria-label="Player settings">
			<h2 class="site-label">Video</h2>
			<Select label="Source" bind:value={s.source}>
				{#each sources as src (src.id)}<option value={src.id}>{src.label}</option>{/each}
			</Select>
			{#if s.source == 'custom'}
				<Input label="Video URL" type="url" placeholder="https://…/video.m3u8" bind:value={draftUrl} hint="HLS, DASH or MP4. Press Enter to load." onchange={() => (s.url = draftUrl)} />
			{/if}
			<h2 class="site-label">Attributes</h2>
			<div class="pg-switches">
				<Switch bind:checked={s.autoplay}>Autoplay</Switch>
				<Switch bind:checked={s.muted}>Muted</Switch>
				<Switch bind:checked={s.loop}>Loop</Switch>
				<Switch bind:checked={s.poster} disabled={!sourceOf(s).poster}>Poster</Switch>
				<Switch bind:checked={s.captions}>Captions</Switch>
				<Switch bind:checked={s.thumbnails} disabled={!hasStoryboard}>Thumbnails</Switch>
				<Switch bind:checked={s.live}>Force live</Switch>
			</div>
			{#if !hasStoryboard}<p class="pg-hint">Thumbnails: only the Big Buck Bunny streams have a storyboard.</p>{/if}
			<Input label="Start at (seconds)" type="number" min="0" value={s.start} onchange={(e: Event) => (s.start = Math.max(0, Number((e.currentTarget as HTMLInputElement).value) || 0))} />
			{#if s.t != 'theming'}
				<h2 class="site-label">Theme</h2>
				<ThemeControls bind:theme={s.theme} />
			{/if}
		</aside>

		<div class="pg-right">
			<section class="pg-code" aria-label="Code">
				<Tabs.Root bind:value={tab as string} variant="line" size="sm">
					<Tabs.List label="Code for">
						{#each TABS as t (t.id)}<Tabs.Tab value={t.id}>{t.label}</Tabs.Tab>{/each}
					</Tabs.List>
					{#each TABS as t (t.id)}
						<Tabs.Panel value={t.id}>
							{#if t.id == tab}<CodeBlock {code} lang={codeLang(t.id)} />{/if}
						</Tabs.Panel>
					{/each}
				</Tabs.Root>
			</section>

			<section class="pg-log" aria-labelledby="pg-log-title">
				<div class="pg-log-head">
					<h2 id="pg-log-title" class="site-label">Events</h2>
					<button type="button" class="pg-clear" onclick={() => (log = [])} disabled={!log.length}><Icon icon={Delete02Icon} size={16} />Clear</button>
				</div>
				<ol role="log" aria-live="off">
					{#each log as entry (entry.id)}
						<li><span class="at">{entry.at}</span><span class="name">{entry.name}</span><span class="detail">{entry.detail}</span></li>
					{:else}
						<li class="empty">Play the video: its events show here as they fire.</li>
					{/each}
				</ol>
			</section>
		</div>
	</div>
	<p class="pg-credit">Demo films: {media.bbb.credit}. {media.sintel.credit}. {media.tos.credit}.</p>
</div>

<style>
	.pg-credit {
		margin: 1.5rem 0 0;
		color: var(--ui-muted);
		font-size: var(--type-small);
	}

	.pg {
		display: grid;
		gap: 1rem;
	}

	h2 {
		margin: 0;
		color: var(--ui-muted);
	}

	/* ---------- Tabs, sticky so the player is always right below them ---------- */

	.pg-tabs {
		position: sticky;
		top: 3.75rem;
		z-index: 3;
		margin-inline: calc(-1 * var(--site-gutter));
		padding: 0.25rem var(--site-gutter) 0;
		background: color-mix(in oklab, var(--ui-bg) 92%, transparent);
		-webkit-backdrop-filter: blur(12px);
		backdrop-filter: blur(12px);
	}

	.pg-tab {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	/* ---------- Stage and the layouts around the one player ---------- */

	.pg-stage {
		display: flex;
		min-width: 0;
	}

	.pg-frame {
		container: frame / inline-size;
		min-width: 0;
		max-width: 100%;
		padding: 1rem;
		border-radius: var(--ui-radius);
		box-shadow: inset 0 0 0 1px var(--ui-line);
		background: var(--ui-bg);
		color: var(--ui-fg);
		overflow: hidden;
		view-transition-name: pg-frame;
	}

	.pg-frame[data-scheme='dark'] {
		color-scheme: dark;
	}

	.pg-frame[data-scheme='light'] {
		color-scheme: light;
	}

	.pg-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-areas: 'before' 'player' 'after' 'aside';
		gap: 1rem;
	}

	.pg-player {
		grid-area: player;
		min-width: 0;
	}

	/* Side content places its pieces around the player by class. */
	.pg-side {
		display: contents;
	}

	.pg-side :global(.side-before) {
		grid-area: before;
	}

	.pg-side :global(.side-after) {
		grid-area: after;
	}

	.pg-side :global(.side-aside) {
		grid-area: aside;
	}

	.pg-side :global(.side-over) {
		grid-area: player;
		align-self: end;
		z-index: 1;
	}

	/* Beside the player when there's room: the episode list, product details. */
	@container frame (min-width: 760px) {
		.pg-layout[data-t='playlist'] {
			grid-template-columns: minmax(0, 1fr) 16rem;
			grid-template-areas: 'player aside' 'after aside';
		}

		.pg-layout[data-t='product'] {
			grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
			grid-template-areas: 'player aside';
			align-items: center;
		}
	}

	.pg-layout[data-t='article'] {
		max-width: 42rem;
		margin-inline: auto;
	}

	.pg-layout[data-t='vertical'] .pg-player {
		width: min(100%, 22rem);
		margin-inline: auto;
	}

	.pg-layout[data-t='vertical'] qyro-player::part(video) {
		object-fit: cover;
	}

	.pg-frame:has(.pg-layout[data-t='cinema']) {
		background: #050506;
		color: #eee;
		color-scheme: dark;
	}

	/* The hero: the player fills the stage as a background loop with the headline over it. */
	.pg-layout[data-t='hero'] {
		margin: -1rem;
		min-height: 30rem;
		grid-template-areas: 'player';
	}

	.pg-layout[data-t='hero'] .pg-player {
		position: relative;
	}

	.pg-layout[data-t='hero'] qyro-player {
		position: absolute;
		inset: 0;
		height: 100%;
		aspect-ratio: auto;
	}

	.pg-layout[data-t='hero'] qyro-player::part(controls),
	.pg-layout[data-t='hero'] qyro-player::part(big-play-button),
	.pg-layout[data-t='hero'] qyro-player::part(top-bar) {
		display: none;
	}

	.pg-layout[data-t='hero'] qyro-player::part(video) {
		object-fit: cover;
	}

	.pg-handle {
		flex: none;
		width: 1rem;
		align-self: stretch;
		cursor: ew-resize;
		touch-action: none;
		display: grid;
		place-items: center;
	}

	.pg-handle::before {
		content: '';
		width: 4px;
		height: 2.5rem;
		border-radius: 4px;
		background: var(--ui-control-line);
		opacity: 0.5;
	}

	.pg-handle:hover::before,
	.pg-handle:focus-visible::before {
		opacity: 1;
	}

	.pg-handle:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		border-radius: 4px;
	}

	.pg-toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
	}

	.pg-desc {
		margin: 0;
		color: var(--ui-muted);
	}

	.pg-toolbar-end {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	/* ---------- Under the player: controls, code, events ---------- */

	.pg-below {
		display: grid;
		grid-template-columns: 20rem minmax(0, 1fr);
		gap: 2rem;
		align-items: start;
		margin-top: 1rem;
	}

	.pg-controls {
		display: grid;
		gap: 0.875rem;
	}

	.pg-controls h2:not(:first-child) {
		margin-top: 0.75rem;
	}

	.pg-switches {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.625rem 1rem;
	}

	.pg-hint {
		margin: -0.25rem 0 0;
		color: var(--ui-muted);
		font-size: var(--type-small);
	}

	.pg-controls :global(.theme-controls) {
		grid-template-columns: minmax(0, 1fr);
	}

	.pg-right {
		display: grid;
		gap: 2rem;
		min-width: 0;
	}

	.pg-log {
		display: grid;
		gap: 0.5rem;
	}

	.pg-log-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.pg-clear {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 2rem;
		padding: 0 0.5rem;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		color: var(--ui-muted);
		font: inherit;
		font-size: var(--type-small);
		cursor: pointer;
	}

	.pg-clear:hover:not(:disabled) {
		color: var(--ui-fg);
		background: var(--ui-subtle);
	}

	.pg-clear:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.pg-log ol {
		max-height: 14rem;
		overflow-y: auto;
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--ui-line);
		font: var(--type-small)/1.5 var(--ui-font-mono);
	}

	.pg-log li {
		display: grid;
		grid-template-columns: 4.5rem 10rem minmax(0, 1fr);
		gap: 0.75rem;
		padding: 0.3rem 0;
		border-bottom: 1px solid var(--ui-line);
	}

	.pg-log .at,
	.pg-log .detail {
		overflow: hidden;
		color: var(--ui-muted);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.pg-log .at {
		font-variant-numeric: tabular-nums;
	}

	.pg-log .empty {
		display: block;
		color: var(--ui-muted);
		font-family: var(--ui-font);
	}

	@media (max-width: 900px) {
		.pg-below {
			grid-template-columns: minmax(0, 1fr);
		}

		.pg-controls :global(.theme-controls) {
			grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		}
	}

	@media (max-width: 600px) {
		.pg-frame {
			padding: 0.5rem;
		}

		.pg-layout[data-t='hero'] {
			margin: -0.5rem;
		}

		.pg-handle {
			display: none;
		}

		.pg-log li {
			grid-template-columns: 4rem 7.5rem minmax(0, 1fr);
			gap: 0.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pg-frame {
			view-transition-name: none;
		}
	}
</style>
