<script lang="ts">
	import ColorPicker from '#lib/sinaui/ui/ColorPicker.svelte';
	import Segmented from '#lib/sinaui/ui/Segmented.svelte';
	import Slider from '#lib/sinaui/ui/Slider.svelte';
	import type { Theme } from './state.js';

	let { theme = $bindable() }: { theme: Theme } = $props();
</script>

<!-- One grid, one row gap: a slider's grab area already pads its track, so rows sit close. -->
<div class="theme-controls">
	<ColorPicker label="Accent" bind:value={theme.accent} swatches={['#ffffff', '#ffd60a', '#64d2ff', '#30d158', '#ff9f0a']} />
	<ColorPicker label="Glass tint" bind:value={theme.tint} swatches={['#1c1c20', '#0a1428', '#2a1030', '#ffffff']} />
	<Slider label="Tint strength" bind:value={theme.tintAlpha} min={0} max={90} format={(v) => `${v}%`} />
	<Slider label="Blur" bind:value={theme.blur} min={0} max={40} format={(v) => `${v}px`} />
	<Slider label="Corner radius" bind:value={theme.radius} min={0} max={32} format={(v) => `${v}px`} />
	<Segmented label="Glass" options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} bind:value={theme.glass as string} />
</div>

<style>
	.theme-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		align-items: start;
		gap: 0.5rem 1.5rem;
	}
</style>
