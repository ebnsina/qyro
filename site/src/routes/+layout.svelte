<script lang="ts">
	import '@fontsource/cabin-condensed/400.css';
	import '@fontsource/cabin-condensed/500.css';
	import '@fontsource/cabin-condensed/600.css';
	import '@fontsource/cabin-condensed/700.css';
	import '@fontsource/geist-mono/400.css';
	import '@fontsource/geist-mono/500.css';
	import '../lib/sinaui/ui/tokens.css';
	import '../lib/site/site.css';
	import { onMount } from 'svelte';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// The player registers itself in the browser; the server just renders the tag.
	onMount(() => {
		import('@ebnsina/qyro');
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://api.fontshare.com" crossorigin="anonymous" />
	<link href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap" rel="stylesheet" />
</svelte:head>

{@render children()}
