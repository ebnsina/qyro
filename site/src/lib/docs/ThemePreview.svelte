<script lang="ts">
	import CodeBlock from '#lib/sinaui/ui/CodeBlock.svelte';
	import ThemeControls from '#lib/demo/ThemeControls.svelte';
	import { DEFAULT_THEME, type Theme } from '#lib/demo/state.js';
	import { file, media } from '#lib/site/links.js';

	let theme = $state<Theme>({ ...DEFAULT_THEME });
	const rgb = (hex: string) => {
		const n = parseInt(hex.slice(1), 16);
		return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
	};
	const vars = $derived({
		'--qyro-accent': theme.accent,
		'--qyro-glass-tint': `rgb(${rgb(theme.tint)} / ${theme.tintAlpha / 100})`,
		'--qyro-glass-blur': `${theme.blur}px`,
		'--qyro-radius': `${theme.radius}px`,
	});
	const style = $derived(Object.entries(vars).map(([k, v]) => `${k}: ${v}`).join('; '));
	const css = $derived(`qyro-player {\n${Object.entries(vars).map(([k, v]) => `\t${k}: ${v};`).join('\n')}\n}`);
</script>

<div class="theme-preview">
	<qyro-player src={media.bbb.hls} poster={media.bbb.poster} title="Theming preview" thumbnails={file(media.bbb.storyboard)} start="60" muted {style} glass={theme.glass == 'light' ? 'light' : undefined}></qyro-player>
	<ThemeControls bind:theme />
	<CodeBlock code={css + (theme.glass == 'light' ? '\n/* and glass="light" on the element */' : '')} lang="css" />
</div>

<style>
	.theme-preview {
		display: grid;
		gap: 1.25rem;
	}
</style>
