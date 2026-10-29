<script lang="ts">
	import { page } from '$app/state';
	import { SITE, file } from './links';

	interface Props {
		title: string;
		description: string;
	}

	let { title, description }: Props = $props();
	const full = $derived(title == 'Qyro' ? 'Qyro: a liquid glass video player' : `${title} · Qyro`);
	const url = $derived(SITE + page.url.pathname);
</script>

<svelte:head>
	<title>{full}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Qyro" />
	<meta property="og:title" content={full} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={SITE + file('/og.png')} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
