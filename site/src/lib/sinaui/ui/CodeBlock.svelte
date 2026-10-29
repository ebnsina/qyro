<script lang="ts" module>
	import { createHighlighter } from '@tanstack/highlight/core';
	import { inView } from './in-view';
	import { css } from '@tanstack/highlight/languages/css';
	import { diff } from '@tanstack/highlight/languages/diff';
	import { go } from '@tanstack/highlight/languages/go';
	import { html } from '@tanstack/highlight/languages/html';
	import { js } from '@tanstack/highlight/languages/js';
	import { json } from '@tanstack/highlight/languages/json';
	import { python } from '@tanstack/highlight/languages/python';
	import { shell } from '@tanstack/highlight/languages/shell';
	import { sql } from '@tanstack/highlight/languages/sql';
	import { svelte } from '@tanstack/highlight/languages/svelte';
	import { ts } from '@tanstack/highlight/languages/ts';
	import { yaml } from '@tanstack/highlight/languages/yaml';

	// One highlighter for every block, the same on server and browser, so hydration matches.
	const highlighter = createHighlighter({
		languages: [css, diff, go, html, js, json, python, shell, sql, svelte, ts, yaml]
	});
	export type Lang =
		| 'css'
		| 'diff'
		| 'go'
		| 'html'
		| 'js'
		| 'json'
		| 'python'
		| 'shell'
		| 'sql'
		| 'svelte'
		| 'ts'
		| 'yaml';
</script>

<script lang="ts">
	import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import { announce } from './announce';
	import Icon from './Icon.svelte';
	import { scrollEdges } from './scroll-edges';

	interface Props {
		code: string;
		lang?: Lang;
		/** Shown above the code ("src/routes/+page.svelte"), and names it for screen readers. */
		filename?: string;
		/** Lines to draw attention to: "3", "3-5", "3-5, 9". */
		highlight?: string;
		lineNumbers?: boolean;
		class?: string;
	}

	let {
		code,
		lang = 'ts',
		filename,
		highlight = '',
		lineNumbers = true,
		class: className
	}: Props = $props();

	const source = $derived(code.replace(/\n+$/, ''));
	const markup = $derived(highlighter.highlight(source, { lang }).html);
	const count = $derived(source.split('\n').length);
	const marked = $derived(
		new Set(
			highlight
				.split(',')
				.map((part) => part.trim().split('-').map(Number))
				.filter(([a]) => a > 0)
				.flatMap(([a, b = a]) => Array.from({ length: b - a + 1 }, (_, i) => a + i))
		)
	);

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout>;
	async function copy() {
		clearTimeout(timer);
		try {
			await navigator.clipboard.writeText(source);
			copied = true;
			announce('Copied');
			timer = setTimeout(() => (copied = false), 1600);
		} catch {
			announce("Couldn't copy. Select the code and copy it instead.");
		}
	}

	// The first time it scrolls into view, the code unrolls from the top. It's only hidden once the
	// page is running, so without JavaScript (or before it loads) the code simply shows.
	let seen = $state(false);
	let armed = $state(false);
	const reveal = (node: HTMLElement) => {
		armed = true;
		return inView(() => (seen = true), { threshold: 0.2 })(node);
	};
</script>

<div class={['codeblock', armed && 'armed', seen && 'seen', className]} {@attach reveal}>
	<header>
		{#if filename}<span class="file">{filename}</span>{:else}<span class="lang">{lang}</span>{/if}
		<button type="button" class="copy" aria-label={copied ? 'Copied' : 'Copy code'} onclick={copy}>
			<!-- The icon swaps with a quick scale, so the change reads as a response to the press. -->
			{#key copied}<span class="icon"
					><Icon icon={copied ? Tick02Icon : Copy01Icon} size={16} /></span
				>{/key}
		</button>
	</header>
	<!-- Focusable so the keyboard can scroll long lines sideways. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="scroll"
		role="region"
		aria-label={filename ?? `${lang} code`}
		tabindex="0"
		{@attach scrollEdges}
		data-fade="x"
	>
		<div class="sheet" style:--lines={count}>
			{#if lineNumbers}
				<ol class="gutter" aria-hidden="true">
					{#each { length: count }, i (i)}<li class:hit={marked.has(i + 1)}>{i + 1}</li>{/each}
				</ol>
			{/if}
			<div class="code">
				{#each [...marked] as line (line)}
					{#if line <= count}<span class="band" style:--at={line - 1} aria-hidden="true"
						></span>{/if}
				{/each}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- the highlighter escapes all source text. -->
				<pre><code>{@html markup}</code></pre>
			</div>
		</div>
	</div>
</div>

<style>
	.codeblock {
		--line: 1.7em;
		margin: 0;
		overflow: hidden;
		border-radius: calc(var(--ui-radius) * 1.5);
		background: color-mix(in srgb, var(--ui-fg) 4%, var(--ui-surface));
		color: var(--ui-fg);
		font: 0.8125rem/1 var(--ui-font-mono);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.375rem 0.375rem 0.375rem 1rem;
		box-shadow: inset 0 -1px var(--ui-line);
	}
	.file,
	.lang {
		overflow: hidden;
		color: var(--ui-muted);
		font-size: 0.75rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.copy {
		display: grid;
		place-items: center;
		inline-size: 2rem;
		block-size: 2rem;
		padding: 0;
		border: 0;
		border-radius: var(--ui-radius-control);
		background: none;
		color: var(--ui-muted);
		cursor: pointer;
		transition:
			background-color var(--ui-dur) ease,
			color var(--ui-dur) ease;
	}
	.copy:hover {
		background: var(--ui-hover);
		color: var(--ui-fg);
	}
	.copy:focus-visible,
	.scroll:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: calc(var(--ui-ring-offset) * -1);
	}
	.icon {
		display: grid;
		animation: swap 220ms var(--ui-ease-out);
	}
	@keyframes swap {
		from {
			opacity: 0;
			transform: scale(0.6);
		}
	}
	.scroll {
		overflow-x: auto;
	}
	/* As wide as the longest line, so scrolled-to text and line highlights aren't cut at the box edge. */
	.sheet {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		inline-size: max-content;
		min-inline-size: 100%;
		padding-block: 0.875rem;
	}
	.armed:not(.seen) .sheet {
		clip-path: inset(0 0 100% 0);
	}
	.armed.seen .sheet {
		clip-path: inset(0 0 0 0);
		transition: clip-path calc(200ms + var(--lines) * 18ms) var(--ui-ease-out);
	}
	.gutter {
		margin: 0;
		padding: 0 0.875rem 0 1rem;
		color: var(--ui-muted);
		list-style: none;
		text-align: end;
		user-select: none;
		-webkit-user-select: none;
	}
	.gutter li {
		block-size: var(--line);
		line-height: var(--line);
		font-variant-numeric: tabular-nums;
	}
	.gutter .hit {
		color: var(--ui-accent);
	}
	.code {
		position: relative;
	}
	/* A highlighted line: a band under the code the full width of the block. */
	.band {
		position: absolute;
		inset-inline: -100vw 0;
		inset-block-start: calc(var(--at) * var(--line));
		block-size: var(--line);
		background: color-mix(in srgb, var(--ui-accent) 12%, transparent);
		box-shadow: inset 2px 0 var(--ui-accent);
	}
	pre {
		position: relative;
		margin: 0;
		font-size: inherit;
		padding-inline-end: 1.25rem;
		line-height: var(--line);
		tab-size: 2;
	}
	.sheet:not(:has(.gutter)) pre {
		padding-inline-start: 1rem;
	}
	code {
		font: inherit;
	}
	/* The highlighter wraps its own pre: no default margin or smaller text, so lines meet the gutter. */
	.code :global(.th-code),
	.code :global(.th-code code) {
		margin: 0;
		font: inherit;
	}
	/* Syntax colors, each 4.5:1 or better on this background in both themes. */
	.codeblock :global(.th-tag),
	.codeblock :global(.th-command),
	.codeblock :global(.th-selector) {
		color: light-dark(#047857, #34d399);
	}
	.codeblock :global(.th-attr),
	.codeblock :global(.th-property) {
		color: light-dark(#9a3412, #fdba74);
	}
	.codeblock :global(.th-string),
	.codeblock :global(.th-link) {
		color: light-dark(#0e7490, #67e8f9);
	}
	.codeblock :global(.th-keyword),
	.codeblock :global(.th-operator) {
		color: light-dark(#9d174d, #f9a8d4);
	}
	.codeblock :global(.th-function) {
		color: light-dark(#1d4ed8, #93c5fd);
	}
	.codeblock :global(.th-number),
	.codeblock :global(.th-literal) {
		color: light-dark(#854d0e, #fde68a);
	}
	.codeblock :global(.th-type),
	.codeblock :global(.th-meta) {
		color: light-dark(#6d28d9, #c4b5fd);
	}
	.codeblock :global(.th-comment) {
		color: light-dark(#57606a, #a3a3a3);
		font-style: italic;
	}
	.codeblock :global(.th-inserted) {
		color: light-dark(#047857, #34d399);
	}
	.codeblock :global(.th-deleted) {
		color: light-dark(#b42318, #ff8a7a);
	}
	@media (prefers-reduced-motion: reduce) {
		.armed:not(.seen) .sheet,
		.armed.seen .sheet {
			clip-path: none;
			transition: none;
		}
		.icon {
			animation: none;
		}
	}
</style>
