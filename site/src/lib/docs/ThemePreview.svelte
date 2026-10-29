<script lang="ts">
	import CodeBlock from '#lib/sinaui/ui/CodeBlock.svelte';
	import ColorPicker from '#lib/sinaui/ui/ColorPicker.svelte';
	import Segmented from '#lib/sinaui/ui/Segmented.svelte';
	import Slider from '#lib/sinaui/ui/Slider.svelte';
	import { file, media } from '#lib/site/links.js';

	let accent = $state('#ffffff');
	let tint = $state('#1c1c20');
	let tintAlpha = $state(36);
	let blur = $state(18);
	let radius = $state(16);
	let glass = $state('dark');

	const hexToRgb = (hex: string) => {
		const n = parseInt(hex.slice(1), 16);
		return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
	};
	const vars = $derived({
		'--qyro-accent': accent,
		'--qyro-glass-tint': `rgb(${hexToRgb(tint)} / ${tintAlpha / 100})`,
		'--qyro-glass-blur': `${blur}px`,
		'--qyro-radius': `${radius}px`,
	});
	const style = $derived(Object.entries(vars).map(([k, v]) => `${k}: ${v}`).join('; '));
	const css = $derived(`qyro-player {\n${Object.entries(vars).map(([k, v]) => `\t${k}: ${v};`).join('\n')}\n}`);
</script>

<div class="theme-preview">
	<qyro-player src={media.bbb.hls} poster={media.bbb.poster} title="Theming preview" thumbnails={file(media.bbb.storyboard)} start="60" muted {style} glass={glass == 'light' ? 'light' : undefined}></qyro-player>
	<div class="theme-controls">
		<ColorPicker label="Accent" bind:value={accent} swatches={['#ffffff', '#ffd60a', '#64d2ff', '#30d158', '#ff9f0a']} />
		<ColorPicker label="Glass tint" bind:value={tint} swatches={['#1c1c20', '#0a1428', '#2a1030', '#ffffff']} />
		<Slider label="Tint strength" bind:value={tintAlpha} min={0} max={90} format={(v) => `${v}%`} />
		<Slider label="Blur" bind:value={blur} min={0} max={40} format={(v) => `${v}px`} />
		<Slider label="Corner radius" bind:value={radius} min={0} max={32} format={(v) => `${v}px`} />
		<Segmented label="Glass" options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} bind:value={glass} />
	</div>
	<CodeBlock code={css + (glass == 'light' ? '\n/* and glass="light" on the element */' : '')} lang="css" />
</div>

<style>
	.theme-preview {
		display: grid;
		gap: 1.25rem;
		margin: 1.5rem 0 2rem;
	}

	.theme-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 1rem 1.5rem;
	}
</style>
