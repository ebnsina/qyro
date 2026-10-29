<script lang="ts">
	import '@fontsource-variable/inter';
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
		import('qyro');
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
