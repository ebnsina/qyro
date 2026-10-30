---
title: Use with AI
description: Add Qyro with Claude Code, Codex and other coding agents, using the Qyro skill and llms.txt.
---

# Use with AI

Most people add Qyro by asking their coding agent. Give the agent the Qyro skill or the llms.txt files and it gets every attribute, event and gotcha right the first time.

## Install the skill

The skill is one folder, `skills/qyro/`, in the npm package (`node_modules/qyro/skills/qyro`) and in the [Qyro repository](https://github.com/ebnsina/qyro/tree/main/skills/qyro). Pick your tool:

<!-- ai:tools -->

## llms.txt

- [/llms.txt](/llms.txt): an index of every docs page, each as Markdown.
- [/llms-full.txt](/llms-full.txt): every docs page in one file.
- Any docs page as Markdown: add `.md` to its address, like [/docs/captions.md](/docs/captions.md).

## Prompts to copy

Each prompt is complete on its own: the task, where to read about Qyro, the rules to follow, and how to check the result. Fill in the parts in angle brackets.

<!-- ai:prompts -->

## Framework snippets

Plain HTML:

```html
<script type="module">
	import 'https://cdn.jsdelivr.net/npm/qyro@0.1.0/dist/qyro.js';
</script>
<qyro-player src="/video.m3u8" title="My video"></qyro-player>
```

SvelteKit (load it in the browser only):

```svelte
<script>
	import { onMount } from 'svelte';
	onMount(() => import('qyro'));
</script>

<qyro-player src="/video.m3u8" title="My video"></qyro-player>
```

React:

```tsx
import { useEffect } from 'react';

export function Video({ src }: { src: string }) {
	useEffect(() => {
		import('qyro');
	}, []);
	return <qyro-player src={src} title="My video" />;
}
```

Vue (tell Vue it's a custom element with `compilerOptions.isCustomElement: (tag) => tag === 'qyro-player'`):

```vue
<script setup>
import 'qyro';
</script>

<template>
	<qyro-player src="/video.m3u8" title="My video" />
</template>
```

## Common mistakes

- **Autoplay without `muted`.** Browsers block it; the play button stays up.
- **Reading properties before the element is defined.** Import `qyro` before your code touches the element, or `await customElements.whenDefined('qyro-player')`. In server-rendered apps, import it in the browser only.
- **Captions or thumbnails from another domain without CORS headers.** They fail to load, and the console names the file.
- **Expecting a volume slider on iPhone.** iOS sets volume with the hardware buttons; Qyro shows mute only on touch screens.
- **Expecting Qyro's controls in iPhone full screen.** iPhone only allows its own full-screen player.
- **`seyr-key` without `video-id`.** The video isn't tracked; the console says so.
- **Using `engine` for things the element already does.** Use the attributes and methods; `engine` is an escape hatch.

## Verify it works

1. Load the page: the poster and round play button show.
2. Play: the video starts, the controls show, and nothing is logged to the console.
3. Press <kbd>Space</kbd>, <kbd>→</kbd>, <kbd>C</kbd>, <kbd>F</kbd> with the player focused.
4. Right-click: the menu ends with the Qyro version.
5. Break the `src` on purpose: the player shows a plain message with Try again, and an `error` event fires.
