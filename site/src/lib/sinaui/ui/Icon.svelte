<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	type IconNode = readonly (readonly [string, Readonly<Record<string, string | number>>])[];

	interface Props extends SVGAttributes<SVGSVGElement> {
		/** Any icon from @hugeicons/core-free-icons. */
		icon: IconNode;
		size?: number | string;
		/** Accessible name. Without it the icon is decorative and hidden from screen readers. */
		label?: string;
		/** Overrides the icon's stroke width (Hugeicons default 1.5). */
		strokeWidth?: number;
	}

	let { icon, size = 18, label, strokeWidth, ...rest }: Props = $props();

	// Rendered in markup, not onMount: icons are in the server HTML, so nothing pops in after hydration.
	const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
	const nodes = $derived(
		icon.map(([tag, attrs]) => ({
			tag,
			attrs: Object.fromEntries(
				Object.entries(attrs)
					.filter(([k]) => k !== 'key')
					.map(([k, v]) => [kebab(k), k === 'strokeWidth' && strokeWidth ? strokeWidth : v])
			)
		}))
	);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill="none"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
	{...rest}
>
	{#each nodes as { tag, attrs }, i (i)}
		<svelte:element this={tag} xmlns="http://www.w3.org/2000/svg" {...attrs} />
	{/each}
</svg>

<style>
	svg {
		flex: none;
		display: block;
	}
</style>
