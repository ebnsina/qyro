<script lang="ts">
	// A tool's brand mark in one color (simple-icons, CC0), or a Hugeicons glyph when there's no usable mark.
	import { siClaude, siCursor, siGithubcopilot, siGooglegemini, siWindsurf } from 'simple-icons';
	import { AiChat02Icon, CommandLineIcon } from '@hugeicons/core-free-icons';
	import Icon from '#lib/sinaui/ui/Icon.svelte';
	import type { Tool } from './ai.js';

	let { tool, size = 18 }: { tool: Tool; size?: number } = $props();
	const marks = { claude: siClaude, cursor: siCursor, copilot: siGithubcopilot, gemini: siGooglegemini, windsurf: siWindsurf };
	const mark = $derived(tool.mark ? marks[tool.mark] : undefined);
</script>

{#if mark}
	<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d={mark.path} /></svg>
{:else}
	<Icon icon={tool.id == 'codex' ? CommandLineIcon : AiChat02Icon} {size} />
{/if}
