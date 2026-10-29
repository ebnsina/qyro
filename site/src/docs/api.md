---
title: JavaScript API
description: Properties and methods on the qyro-player element, with TypeScript types.
---

# JavaScript API

```ts
import 'qyro';
import type { QyroPlayer } from 'qyro';

const player = document.querySelector('qyro-player') as QyroPlayer;
await player.ready;
player.play();
```

## Properties

| Property | Type | Notes |
| --- | --- | --- |
| `src` | `string` | Same as the attribute. |
| `poster` | `string` | |
| `autoplay`, `loop` | `boolean` | |
| `playsInline` | `boolean` | `true` unless `playsinline="false"`. |
| `start` | `number \| null` | Seconds. |
| `currentTime` | `number` | Setting it seeks. |
| `duration` | `number` | `Infinity` for live. |
| `paused`, `ended` | `boolean` | Read only. |
| `muted` | `boolean` | |
| `volume` | `number` | 0 to 1. |
| `playbackRate` | `number` | |
| `live` | `boolean` | Read only. |
| `fullscreen` | `boolean` | Read only. |
| `error` | `PlayerError \| null` | The current error, if any. |
| `video` | `HTMLVideoElement` | The video inside the player. |
| `ready` | `Promise` | Resolves once the playback engine has started. |
| `chapters` | `Chapter[]` | `{ start, end?, title }` in seconds, sorted. Set them, or `null` for the file's. See [Chapters](/docs/chapters). |
| `chapter` | `Chapter \| null` | The chapter playing now. Read only. |
| `engine` | object or `null` | Advanced escape hatch: the playback engine itself. Most sites never need it. |

## Methods

| Method | What it does |
| --- | --- |
| `play()` | Starts playback. Returns the browser's play promise. |
| `pause()` | Pauses. |
| `togglePlay()` | Plays or pauses. |
| `seek(seconds)` | Seeks, kept inside what can be played. |
| `goToLive()` | Jumps to the live edge of a live stream. |
| `addTextTrack(src, language, label?, kind?)` | Adds a caption file. Resolves when it's loaded. |
| `toggleFullscreen()` | Enters or leaves full screen (native full screen on iPhone). |
| `togglePictureInPicture()` | Enters or leaves picture in picture. |
| `seekToChapter(index)` | Seeks to the start of a chapter, from 0. |
| `retry()` | Loads again after an error, from where it stopped. |

## Playlists

```js
player.playlist = [
	{ src: '/ep1.m3u8', title: 'Episode 1', poster: '/ep1.jpg', duration: 1520, videoId: 'ep-1' },
	{ src: '/ep2.m3u8', title: 'Episode 2', captions: [{ src: '/ep2.en.vtt', srclang: 'en', label: 'English' }] },
];
player.next();
player.previous(); // back to the start, or the video before when this one has just begun
player.index = 1; // play the second one
```

With a playlist, previous and next buttons sit beside play, and an Up next list opens from the list button. Near the end, an Up next card counts down with Play now and Cancel. Each item is its own view in analytics. <kbd>Shift</kbd> + <kbd>N</kbd> and <kbd>Shift</kbd> + <kbd>P</kbd> move through it.

| Property or method | What it does |
| --- | --- |
| `playlist` | The items; setting it starts the first one. Each needs `src`; `title`, `poster`, `duration`, `thumbnails`, `captions` and `videoId` are optional. |
| `index` | The item playing, or -1. Setting it plays that item. |
| `autoadvance` | Plays the next item when one ends. `true` unless `autoadvance="false"`. |
| `next()`, `previous()` | Move through the list. |

## Types

```ts
type ErrorKind = 'network' | 'offline' | 'not-found' | 'unsupported' | 'drm' | 'unknown';

interface PlayerError {
	kind: ErrorKind;
	title: string; // what the viewer saw
	message: string;
	code?: number; // for developers only
	cause?: unknown; // the raw error, for developers only
}
```
