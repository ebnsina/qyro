<script lang="ts">
	// Old per-template pages now open the playground on that template.
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { to } from '#lib/site/links.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const target = $derived(`${to('/demo')}?t=${data.slug}`);
	onMount(() => goto(target, { replace: true }));
</script>

<svelte:head>
	<title>Demo · Qyro</title>
	<meta http-equiv="refresh" content="0; url={target}" />
	<link rel="canonical" href={target} />
</svelte:head>

<p><a href={target}>Open this demo</a></p>
