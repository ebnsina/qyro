<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
	import CodeBlock from '#lib/sinaui/ui/CodeBlock.svelte';
	import CopyButton from '#lib/sinaui/ui/CopyButton.svelte';
	import Icon from '#lib/sinaui/ui/Icon.svelte';
	import ToolMark from './ToolMark.svelte';
	import { fullPrompt, prompts, tools } from './ai.js';

	/** tools: the switcher and install steps. prompts: the prompt list. compact: the landing page's short version. */
	let { show = 'tools' }: { show?: 'tools' | 'prompts' | 'compact' } = $props();
	const compact = $derived(show == 'compact');

	const KEY = 'qyro:ai-tool';
	let id = $state(tools[0].id);
	let open = $state<Record<string, boolean>>({});
	const tool = $derived(tools.find((t) => t.id == id) ?? tools[0]);
	const list = $derived(compact ? prompts.slice(0, 3) : prompts);

	// The choice lives in the URL (shareable) and in this browser (remembered).
	onMount(() => {
		const fromUrl = new URL(location.href).searchParams.get('tool');
		let saved: string | null = null;
		try {
			saved = localStorage.getItem(KEY);
		} catch {
			// No storage: the first tool is fine.
		}
		const pick = [fromUrl, saved].find((t) => t && tools.some((x) => x.id == t));
		if (pick) id = pick;
	});

	function choose(next: string) {
		id = next;
		try {
			localStorage.setItem(KEY, next);
		} catch {
			// Not remembered; the URL still carries it.
		}
		if (!compact) {
			const url = new URL(location.href);
			url.searchParams.set('tool', next);
			history.replaceState(history.state, '', url);
		}
	}

	function key(e: KeyboardEvent, i: number) {
		const n = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tools.length - 1 }[e.key];
		if (n === undefined) return;
		e.preventDefault();
		const t = tools[(n + tools.length) % tools.length];
		choose(t.id);
		(e.currentTarget as HTMLElement).parentElement?.querySelector<HTMLElement>(`[data-tool="${t.id}"]`)?.focus();
	}
</script>

<div class={['ai', compact && 'ai-compact']}>
	{#if show != 'prompts'}
	<div class="ai-tools" role="radiogroup" aria-label="Your AI tool">
		{#each tools as t, i (t.id)}
			<button type="button" role="radio" data-tool={t.id} aria-checked={t.id == id} tabindex={t.id == id ? 0 : -1} onclick={() => choose(t.id)} onkeydown={(e) => key(e, i)}>
				<ToolMark tool={t} />
				<span>{t.name}</span>
			</button>
		{/each}
	</div>
	{/if}

	{#if show == 'tools'}
		<div class="ai-install">
			<h3>Install the skill in {tool.name}</h3>
			<p>Put the Qyro skill in <code>{tool.where}</code>. From your project's folder:</p>
			<CodeBlock code={tool.command} lang="shell" />
			<p class="ai-note">{tool.note} <a href={tool.docs} rel="noopener">{tool.name} docs</a></p>
		</div>
	{/if}

	{#if show != 'tools'}
	<ul class="ai-prompts">
		{#each list as p (p.id)}
			{@const text = fullPrompt(p)}
			<li>
				<div class="ai-prompt-head">
					<div>
						<h4>{p.title}</h4>
						<p>{p.summary}</p>
					</div>
					<CopyButton value={text} size="sm" variant="secondary" copied="Copied">Copy full prompt</CopyButton>
				</div>
				{#if !compact}
					<pre id="prompt-{p.id}" class={['ai-preview', open[p.id] && 'open']}>{text}</pre>
					<button type="button" class="ai-more" aria-expanded={!!open[p.id]} aria-controls="prompt-{p.id}" onclick={() => (open[p.id] = !open[p.id])}>
						<span>{open[p.id] ? 'Show less' : 'Show full prompt'}</span>
						<span class="chev"><Icon icon={ArrowDown01Icon} size={16} /></span>
					</button>
				{/if}
			</li>
		{/each}
	</ul>
	{/if}
</div>

<style>
	.ai {
		display: grid;
		gap: 1.25rem;
	}

	.ai-tools {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.ai-tools button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.5rem;
		padding: 0 0.875rem;
		border: 1px solid var(--ui-line);
		border-radius: 999px;
		background: none;
		color: var(--ui-muted);
		font: inherit;
		font-size: 0.9375rem;
		cursor: pointer;
		transition:
			color 150ms,
			border-color 150ms;
	}

	.ai-tools button:hover {
		color: var(--ui-fg);
	}

	.ai-tools button[aria-checked='true'] {
		color: var(--ui-fg);
		border-color: var(--ui-control-line);
		font-weight: 550;
	}

	.ai-tools button:focus-visible {
		outline: var(--ui-ring-width) solid var(--ui-ring);
		outline-offset: 2px;
	}

	.ai-install {
		display: grid;
		gap: 0.75rem;
	}

	h3 {
		margin: 0.5rem 0 0;
		font-size: 1.0625rem;
		font-weight: 600;
	}

	.ai-install p,
	.ai-note {
		margin: 0;
	}

	.ai-note {
		color: var(--ui-muted);
		font-size: 0.9375rem;
	}

	.ai-prompts {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--ui-line);
	}

	.ai-prompts > li {
		padding-block: 1.125rem;
		border-bottom: 1px solid var(--ui-line);
	}

	.ai-prompt-head {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 1rem;
	}

	h4 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.ai-prompt-head p {
		margin: 0.2rem 0 0;
		color: var(--ui-muted);
		font-size: 0.9375rem;
	}

	/* Three lines of the prompt, then a fade; expanding shows all of it. */
	.ai-preview {
		margin: 0.75rem 0 0;
		max-height: 4.8em;
		overflow: hidden;
		color: var(--ui-muted);
		font: 0.8125rem/1.6 var(--ui-font-mono);
		white-space: pre-wrap;
		mask-image: linear-gradient(to bottom, #000 40%, transparent);
	}

	.ai-preview.open {
		max-height: none;
		mask-image: none;
		color: var(--ui-fg);
	}

	.ai-more {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		min-height: 2.25rem;
		margin-top: 0.25rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--ui-fg);
		font: inherit;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.ai-more:hover span:first-child {
		text-decoration: underline;
	}

	.chev {
		display: inline-grid;
		transition: transform 200ms;
	}

	.ai-more[aria-expanded='true'] .chev {
		transform: rotate(180deg);
	}

	@media (max-width: 560px) {
		.ai-prompt-head {
			flex-direction: column;
		}
	}
</style>
