<script lang="ts">
	import { Alert02Icon, Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import type { Snippet } from 'svelte';
	import { announce } from './announce';
	import Button from './Button.svelte';
	import Morph from './Morph.svelte';
	import Tooltip from './Tooltip.svelte';

	interface Props {
		/** The text to copy, or a function that returns it (may be async). */
		value: string | (() => string | Promise<string>);
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		/** Icon only, named by its tooltip ("Copy", then "Copied"). */
		square?: boolean;
		/** Shown after copying, in place of the label. */
		copied?: string;
		/** The label; "Copy" by default. */
		children?: Snippet;
		class?: string;
	}

	let {
		value,
		variant = 'secondary',
		size = 'md',
		square = false,
		copied = 'Copied',
		children,
		class: className
	}: Props = $props();

	let state = $state<'idle' | 'done' | 'failed'>('idle');
	let timer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => () => clearTimeout(timer));

	async function copy() {
		clearTimeout(timer);
		try {
			await navigator.clipboard.writeText(typeof value === 'string' ? value : await value());
			state = 'done';
		} catch {
			state = 'failed';
		}
		announce(state === 'done' ? copied : "Couldn't copy");
		timer = setTimeout(() => (state = 'idle'), 1600);
	}
	const tip = $derived(state === 'done' ? copied : state === 'failed' ? "Couldn't copy" : 'Copy');
</script>

{#snippet label()}{#if children}{@render children()}{:else}Copy{/if}{/snippet}

{#if square}
	<Tooltip text={tip} labels>
		{#snippet trigger(props)}
			<Button
				{variant}
				{size}
				square
				class={['copy', state, className].filter(Boolean).join(' ')}
				{...props}
				onclick={copy}
			>
				<Morph
					current={state}
					states={[
						{ key: 'idle', icon: Copy01Icon },
						{ key: 'done', icon: Tick02Icon },
						{ key: 'failed', icon: Alert02Icon }
					]}
				/>
			</Button>
		{/snippet}
	</Tooltip>
{:else}
	<!-- The name stays the label; the result is announced. -->
	<Button
		{variant}
		{size}
		class={['copy', state, className].filter(Boolean).join(' ')}
		onclick={copy}
	>
		<Morph
			current={state}
			states={[
				{ key: 'idle', icon: Copy01Icon, label },
				{ key: 'done', icon: Tick02Icon, text: copied },
				{ key: 'failed', icon: Alert02Icon, text: "Couldn't copy" }
			]}
		/>
	</Button>
{/if}

<style>
	:global(.btn.copy.failed) {
		color: var(--ui-danger);
	}
</style>
