---
title: Attributes
description: Every attribute qyro-player understands, with its default.
---

# Attributes

Set these in HTML or with `setAttribute`. Most have a matching property (see [JavaScript API](/docs/api)).

| Attribute | Value | What it does |
| --- | --- | --- |
| `src` | URL | The video: HLS `.m3u8`, DASH `.mpd`, or a file such as `.mp4`. A `#t=90` on the end starts at 90 seconds. Changing it loads the new video. |
| `poster` | URL | Image shown before playback. |
| `title` | text | Shown top left while the controls show, and used as the player's accessible name. |
| `autoplay` | boolean | Starts on its own. Browsers only allow this when `muted` is set too. |
| `muted` | boolean | Starts muted. |
| `loop` | boolean | Plays again from the start at the end. |
| `playsinline` | `"false"` to turn off | On by default, so iPhone plays inside the page. `playsinline="false"` lets iPhone take over the screen on play. |
| `start` | seconds | Where playback starts. |
| `live` | boolean | Treat the stream as live. Live streams are found on their own; use this only when a stream doesn't say so. |
| `thumbnails` | URL | A WebVTT storyboard for the seek preview. See [Thumbnails](/docs/thumbnails). |
| `glass` | `"light"` | Milky glass with dark glyphs, for bright videos. Dark glass is the default. |
| `seyr-key` | text | Turns on [Seyr analytics](/docs/analytics) with this project key. |
| `seyr-host` | URL | Where your Seyr server runs. |
| `video-id` | text | The id analytics reports for this video. Needed with `seyr-key`. |
| `series` | text | Series or show name for analytics. |

## Captions as children

```html
<qyro-player src="/movie.m3u8">
	<track kind="subtitles" srclang="en" label="English" src="/en.vtt" default />
	<track kind="subtitles" srclang="es" label="Español" src="/es.srt" />
</qyro-player>
```

WebVTT, SRT and TTML files work. See [Captions](/docs/captions).
