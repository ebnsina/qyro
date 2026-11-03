---
title: Getting started
description: Install Qyro from npm or with one script tag, and put a video on the page.
---

# Getting started

Qyro is one HTML element, `<qyro-player>`. It works in plain HTML and in every framework, because it is a standard web component.

## Install

With a bundler (Vite, SvelteKit, React, Vue, Astro, anything):

```shell
npm install @ebnsina/qyro
```

```js
import '@ebnsina/qyro';
```

Without a bundler, one script tag gives you everything in a single file:

```html
<script src="https://cdn.jsdelivr.net/npm/@ebnsina/qyro@0.1.0/dist/qyro.iife.js"></script>
```

## Add a video

```html
<qyro-player
	src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
	poster="/poster.jpg"
	title="Big Buck Bunny"
></qyro-player>
```

`src` takes HLS (`.m3u8`), DASH (`.mpd`) or a plain file such as MP4. The player sizes itself to the width of its container at 16:9 and never changes size on its own, so nothing on the page shifts when a video loads. For other shapes, set `--qyro-aspect-ratio` (for example `2.4` for a widescreen film) and the picture fills it.

## Check it works

1. The poster and a round play button show, with the title in the top left.
2. Press play: the video starts and the controls fade in at the bottom.
3. Press <kbd>Space</kbd>, <kbd>←</kbd>, <kbd>→</kbd> and <kbd>F</kbd> with the player focused.
4. Open the gear for quality, speed and captions; right-click for the player menu.

If something is wrong, the player says so in plain words with a Try again button, and the element fires an `error` event whose `detail` has the code. See [Events](/docs/events).

## Next

- Every attribute: [Attributes](/docs/attributes)
- Control it from code: [JavaScript API](/docs/api)
- Make it yours: [Theming](/docs/theming)
