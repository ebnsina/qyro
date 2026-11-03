<script lang="ts">
	import CodeBlock from '#lib/sinaui/ui/CodeBlock.svelte';
	import ThemeControls from '#lib/demo/ThemeControls.svelte';
	import { initial, themeVars, type Theme } from '#lib/demo/state.js';
	import { file, media } from '#lib/site/links.js';

	let theme = $state<Theme>(initial().theme);
	// Only what differs from Qyro's defaults, the same values the playground sets and the CSS panel shows.
	const vars = $derived(themeVars(theme));
	const style = $derived(Object.entries(vars).map(([k, v]) => `${k}: ${v}`).join('; '));
	const css = $derived(
		Object.keys(vars).length
			? `qyro-player {\n${Object.entries(vars).map(([k, v]) => `\t${k}: ${v};`).join('\n')}\n}`
			: '/* Qyro\'s defaults. Change a control to see the CSS here. */',
	);
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
