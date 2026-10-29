<script lang="ts">
	import { getContext } from 'svelte';
	import ThemeControls from './ThemeControls.svelte';
	import type { PlaygroundContext } from './context.js';

	const ctx = getContext<PlaygroundContext>('playground');
</script>

<div class="side-after">
	<ThemeControls bind:theme={ctx.state.theme} />
</div>
