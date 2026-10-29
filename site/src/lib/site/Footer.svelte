<script lang="ts">
	import ThemeToggle from '#lib/sinaui/ui/ThemeToggle.svelte';
	import Mark from './Mark.svelte';
	import { GITHUB, media, to } from './links';

	const columns = [
		{ title: 'Product', links: [['Demo', to('/demo')], ['Getting started', to('/docs/getting-started')], ['Theming', to('/docs/theming')], ['Changelog', `${GITHUB}/blob/main/CHANGELOG.md`]] },
		{ title: 'Docs', links: [['Attributes', to('/docs/attributes')], ['JavaScript API', to('/docs/api')], ['Captions', to('/docs/captions')], ['Live', to('/docs/live')]] },
		{ title: 'Use with AI', links: [['Skill and prompts', to('/docs/ai')], ['llms.txt', to('/llms.txt')], ['llms-full.txt', to('/llms-full.txt')]] },
		{ title: 'Project', links: [['GitHub', GITHUB], ['MIT licence', `${GITHUB}/blob/main/LICENSE`], ['Third-party notices', `${GITHUB}/blob/main/THIRD_PARTY_NOTICES`]] },
	];
</script>

<footer class="site-footer">
	<div class="site-footer-inner">
		<div class="site-footer-brand">
			<Mark />
			<p>A beautiful video player for any website. Free and open source.</p>
			<ThemeToggle size="sm" />
		</div>
		{#each columns as col (col.title)}
			<div class="site-footer-col">
				<h2>{col.title}</h2>
				<ul>
					{#each col.links as [label, href] (href)}
						<li><a {href}>{label}</a></li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
	<p class="site-credit">
		Demo films: {media.bbb.credit}. {media.sintel.credit}. {media.tos.credit}.
	</p>
</footer>
