# Qyro

A beautiful video player for any website. One element, `<qyro-player>`, streams HLS, DASH, live and MP4 with captions, storyboard thumbnails, and full keyboard, touch and screen reader support. It works in plain HTML and in every framework, and its controls are frosted glass.

**Docs and demos:** https://ebnsina.github.io/qyro · **For AI agents:** [`skills/qyro/SKILL.md`](skills/qyro/SKILL.md) and https://ebnsina.github.io/qyro/llms.txt

## Install

```shell
npm install @ebnsina/qyro
```

```js
import '@ebnsina/qyro';
```

Or with no build step, one file:

```html
<script src="https://cdn.jsdelivr.net/npm/@ebnsina/qyro@0.1.0/dist/qyro.iife.js"></script>
```

## Use

```html
<qyro-player src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" poster="/poster.jpg" title="Big Buck Bunny" thumbnails="/storyboard.vtt">
	<track kind="subtitles" srclang="en" label="English" src="/en.vtt" default />
	<track kind="chapters" src="/chapters.vtt" />
</qyro-player>
```

```js
const player = document.querySelector('qyro-player');
player.addEventListener('ended', () => console.log('done'));
player.seek(30);
player.play();
```

## Frameworks and server rendering

Qyro is a standard custom element, so it works in any framework that renders HTML. Import it once in the browser, then use `<qyro-player>` like any element.

- **React 19+:** `<qyro-player src={src} />`. Get a ref to the element to call methods such as `play()` and `seek()`.
- **Vue:** tell the compiler the tag is native: `compilerOptions: { isCustomElement: (tag) => tag === 'qyro-player' }`.
- **Angular:** add `CUSTOM_ELEMENTS_SCHEMA` to the component's `schemas`.
- **Svelte, Solid, Lit, Stencil:** no configuration needed.
- **Next.js, Nuxt, SvelteKit, Astro (server rendering):** importing `qyro` on the server is safe; the element only upgrades in the browser. Call `player.play()` and similar only after mount, in an effect or `onMounted`.

## Attributes

`src`, `poster`, `title`, `autoplay`, `muted`, `loop`, `playsinline` (on by default), `start`, `live`, `thumbnails`, `chapters`, `glass="light"`, and for analytics `seyr-key`, `seyr-host`, `video-id`, `series`. Details: [Attributes](https://ebnsina.github.io/qyro/docs/attributes).

## API and events

Properties mirror `<video>` (`currentTime`, `duration`, `paused`, `volume`, `muted`, `playbackRate`) plus `live`, `chapters`, `chapter`, `error`, `video`, `ready` and `engine`. Methods: `play()`, `pause()`, `togglePlay()`, `seek()`, `seekToChapter()`, `goToLive()`, `addTextTrack()`, `toggleFullscreen()`, `togglePictureInPicture()`, `retry()`. The element fires the standard media events, `chapterchange`, and an `error` event whose `detail` has the error kind and code. Details: [JavaScript API](https://ebnsina.github.io/qyro/docs/api), [Events](https://ebnsina.github.io/qyro/docs/events).

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

Off unless you set `seyr-key`. Then Qyro loads the [Seyr](https://github.com/ebnsina/seyr) video SDK, from `@seyr/video` if you `import '@ebnsina/qyro/seyr'`, or from `<seyr-host>/js/seyr-video.js`, and reports startup, rebuffering, quality, errors and watch time to your own server. See [Analytics](https://ebnsina.github.io/qyro/docs/analytics).

## Browser support

Current and previous Chrome, Edge, Firefox and Safari on desktop, iOS, iPadOS and Android. iPhone uses its own full-screen player and hardware volume. See [Browser support](https://ebnsina.github.io/qyro/docs/browser-support).

## Sizes

Qyro itself is about 32 kB gzipped. The playback engine (about 255 kB gzipped) loads the first time a player needs it. The single-file script build has both: about 279 kB gzipped. `pnpm build` prints the current numbers.

## Develop

```shell
pnpm install
pnpm dev          # playground at http://localhost:5310/playground/
pnpm test         # unit tests
pnpm test:e2e     # end-to-end tests (Chromium and WebKit, desktop and touch)
pnpm build        # library, script build, types and sizes
pnpm --filter qyro-site dev   # the website
```

The docs live in `site/src/docs/*.md`; the website, `llms.txt`, the Markdown copies and `skills/qyro/SKILL.md` are all made from them (`pnpm skill` rebuilds the skill, `pnpm check` fails if it's stale).

## Licence

MIT, see [LICENSE](LICENSE). The bundled playback engine is Apache-2.0 and the icons are MIT; see [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES). Demo films are from the Blender Foundation under CC BY 3.0.
