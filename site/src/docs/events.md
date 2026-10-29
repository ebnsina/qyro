---
title: Events
description: Media events re-dispatched on qyro-player, and the error event.
---

# Events

The element fires the same media events as a `<video>`, so code written for video works unchanged:

`loadstart`, `loadedmetadata`, `loadeddata`, `canplay`, `canplaythrough`, `play`, `playing`, `pause`, `waiting`, `seeking`, `seeked`, `timeupdate`, `durationchange`, `progress`, `ratechange`, `volumechange`, `ended`, `enterpictureinpicture`, `leavepictureinpicture`.

```js
player.addEventListener('ended', () => showNextEpisode());
player.addEventListener('timeupdate', () => saveProgress(player.currentTime));
```

## qualitychange

Fires when the picture changes resolution, whether the viewer chose it or Auto did:

```js
player.addEventListener('qualitychange', (e) => {
	const { height, width, bitrate, auto } = e.detail; // e.g. 720, 1280, 2149280, true
});
```

## error

When playback fails, the viewer sees a plain message and a Try again button. Your code gets an `error` event with the details:

```js
player.addEventListener('error', (e) => {
	const { kind, code, cause } = e.detail;
	report({ kind, code });
});
```

| `kind` | Viewer sees |
| --- | --- |
| `offline` | You're offline. It retries on its own when the connection comes back. |
| `network` | Check your connection. Also retried when the browser comes back online. |
| `not-found` | This video can't play right now. |
| `unsupported` | This video format isn't supported on this device. |
| `drm` | This video is protected and couldn't be unlocked. |
| `unknown` | This video can't play right now. |

Codes and causes never reach the screen or the console.
