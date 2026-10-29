<script lang="ts">
	import { flushSync, onMount } from 'svelte';
	import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { isDark, setTheme } from './theme.js';

	interface Props {
		/** Accessible name; pressed means the dark theme is on. */
		label?: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { label = 'Dark theme', size = 'md' }: Props = $props();

	let dark = $state(false);

	// Follows the page, so a theme set elsewhere (another toggle, a menu, the system) updates the icon.
	onMount(() => {
		const sync = () => (dark = isDark());
		sync();
		const observer = new MutationObserver(sync);
		observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
		const system = matchMedia('(prefers-color-scheme: dark)');
		system.addEventListener('change', sync);
		return () => {
			observer.disconnect();
			system.removeEventListener('change', sync);
		};
	});
</script>

<Button
	variant="ghost"
	{size}
	square
	aria-label={label}
	aria-pressed={dark}
	onclick={(e: MouseEvent) => {
		const next = !dark;
		setTheme(next, e.currentTarget as Element, () => flushSync(() => (dark = next)));
	}}
>
	<Icon icon={dark ? Sun03Icon : Moon02Icon} />
</Button>
