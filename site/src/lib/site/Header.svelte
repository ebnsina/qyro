<script lang="ts">
	import Button from '#lib/sinaui/ui/Button.svelte';
	import ThemeToggle from '#lib/sinaui/ui/ThemeToggle.svelte';
	import { GITHUB, to } from './links';

	const nav = [
		{ label: 'Docs', href: to('/docs/getting-started') },
		{ label: 'Demo', href: to('/demo') },
		{ label: 'Use with AI', href: to('/docs/ai') },
		{ label: 'Ethos', href: to('/ethos') },
		{ label: 'GitHub', href: GITHUB },
	];
</script>

<a class="site-skip" href="#main">Skip to content</a>
<header class="site-header">
	<div class="site-header-inner">
		<a class="site-home" href={to('/')}>Qyro</a>
		<nav aria-label="Main">
			<ul>
				{#each nav as item (item.href)}
					<li><a href={item.href}>{item.label}</a></li>
				{/each}
			</ul>
		</nav>
		<div class="site-header-end">
			<ThemeToggle size="sm" />
			<Button size="sm" href={to('/docs/getting-started')}>Get started</Button>
		</div>
	</div>
</header>
