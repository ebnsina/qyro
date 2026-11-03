# Qyro

A video player for any website. One element, `<qyro-player>`, plays HLS, DASH, live and MP4 with captions, chapters, storyboard thumbnails, and full keyboard, touch and screen reader support. It works in plain HTML and in every framework.

[![npm](https://img.shields.io/npm/v/@ebnsina/qyro.svg)](https://www.npmjs.com/package/@ebnsina/qyro) [![CI](https://github.com/ebnsina/qyro/actions/workflows/ci.yml/badge.svg)](https://github.com/ebnsina/qyro/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**[Documentation and live demos](https://ebnsina.github.io/qyro)** · [For AI agents](skills/qyro/SKILL.md) · [Changelog](CHANGELOG.md)

## Features

- **Streams:** HLS, DASH, live and MP4, with quality and audio track selection.
- **Captions and chapters:** WebVTT, SRT and TTML captions, a chapter list, and chapter markers on the timeline.
- **Previews:** storyboard thumbnails on hover and while scrubbing.
- **Live:** a DVR window to scrub back through, a "Go live" button, and a live indicator.
- **Touch and keyboard:** double-tap to seek, long-press for the menu, and keyboard shortcuts.
- **Accessible:** screen reader labels, focus handling, and captions that follow the viewer's preferences.
- **Themable:** CSS custom properties and parts for colour, radius and the glass look.
- **Analytics (optional):** playback metrics sent to your own [Seyr](https://github.com/ebnsina/seyr) server.

## Install

```sh
npm install @ebnsina/qyro
```

```js
import '@ebnsina/qyro';
```

No build step? Load the single-file script instead:

```html
<script src="https://cdn.jsdelivr.net/npm/@ebnsina/qyro@0.1.0/dist/qyro.iife.js"></script>
```

## Quick start

```html
<qyro-player src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" poster="/poster.jpg" title="Big Buck Bunny" thumbnails="/storyboard.vtt">
	<track kind="subtitles" srclang="en" label="English" src="/en.vtt" default />
	<track kind="chapters" src="/chapters.vtt" />
</qyro-player>
```

Control it from JavaScript, the same way as a `<video>` element:

```js
const player = document.querySelector('qyro-player');
player.addEventListener('ended', () => console.log('done'));
player.seek(30);
player.play();
```

## Frameworks and server rendering

Qyro is a standard custom element. Import it once in the browser, then use `<qyro-player>` like any element.

| Framework | Setup |
| --- | --- |
| React 19+ | `<qyro-player src={src} />`. Use a ref to call `play()` and `seek()`. |
| Vue | Mark the tag as native: `compilerOptions: { isCustomElement: (tag) => tag === 'qyro-player' }`. |
| Angular | Add `CUSTOM_ELEMENTS_SCHEMA` to the component's `schemas`. |
| Svelte, Solid, Lit, Stencil | No configuration. |
| Next.js, Nuxt, SvelteKit, Astro | Importing on the server is safe; the element upgrades only in the browser. Call methods after mount. |

## Attributes, properties and events

- **Attributes:** `src`, `poster`, `title`, `autoplay`, `muted`, `loop`, `playsinline` (on by default), `start`, `live`, `thumbnails`, `chapters`, `glass="light"`, and analytics attributes `seyr-key`, `seyr-host`, `video-id` and `series`. See [Attributes](https://ebnsina.github.io/qyro/docs/attributes).
- **Properties:** mirror `<video>` (`currentTime`, `duration`, `paused`, `volume`, `muted`, `playbackRate`), plus `live`, `chapters`, `chapter`, `error`, `video`, `ready` and `engine`.
- **Methods:** `play()`, `pause()`, `togglePlay()`, `seek()`, `seekToChapter()`, `goToLive()`, `addTextTrack()`, `toggleFullscreen()`, `togglePictureInPicture()`, `retry()`.
- **Events:** the standard media events, `chapterchange`, and `error`, whose `detail` holds the error kind and code.

Full reference: [JavaScript API](https://ebnsina.github.io/qyro/docs/api) and [Events](https://ebnsina.github.io/qyro/docs/events).

## Theming

```css
qyro-player {
	--qyro-accent: #ffd60a;
	--qyro-radius: 24px;
	--qyro-glass-tint: rgb(10 20 40 / 0.45);
}
qyro-player::part(big-play-button) {
	width: 96px;
	height: 96px;
}
```

Every token and part, with a live preview: [Theming](https://ebnsina.github.io/qyro/docs/theming).

## Analytics

Analytics are off unless you set `seyr-key`. Then Qyro loads the [Seyr](https://github.com/ebnsina/seyr) video SDK, either from `@ebnsina/qyro/seyr` (import it to bundle the SDK from npm) or from `<seyr-host>/js/seyr-video.js`. It reports startup, rebuffering, quality, errors and watch time to your own server. See [Analytics](https://ebnsina.github.io/qyro/docs/analytics).

## Browser support

Current and previous Chrome, Edge, Firefox and Safari on desktop, iOS, iPadOS and Android. iPhone uses its own full-screen player and hardware volume. See [Browser support](https://ebnsina.github.io/qyro/docs/browser-support).

## Bundle size

| Build | Gzipped |
| --- | --- |
| Qyro (`dist/qyro.js`) | about 32 kB |
| Playback engine, loaded on first play | about 255 kB |
| Single-file script (`dist/qyro.iife.js`) | about 279 kB |

`pnpm build` prints the current numbers.

## Development

```sh
pnpm install
pnpm dev                       # playground at http://localhost:5310/playground/
pnpm test                      # unit tests
pnpm test:e2e                  # end-to-end tests in Chromium and WebKit, desktop and touch
pnpm build                     # library, script build, types and sizes
pnpm --filter qyro-site dev    # the documentation site
```

The docs live in `site/src/docs/*.md`. The website, `llms.txt`, the Markdown copies and `skills/qyro/SKILL.md` are generated from them. `pnpm skill` rebuilds the skill, and `pnpm check` fails if it is out of date.

The end-to-end tests need `ffmpeg` to build their live test streams (`scripts/live.sh`).

## License

MIT, see [LICENSE](LICENSE). The bundled playback engine is Apache-2.0 and the icons are MIT; see [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES). Demo films are from the Blender Foundation under CC BY 3.0.
