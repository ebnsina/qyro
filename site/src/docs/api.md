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
| `retry()` | Loads again after an error, from where it stopped. |

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
