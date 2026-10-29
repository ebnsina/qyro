---
title: Captions
description: Sideloaded WebVTT, SRT and TTML, captions inside the stream, languages, and viewer styling.
---

# Captions

Qyro shows captions from three places:

- `<track>` children: WebVTT, SRT or TTML files.
- Captions inside the stream: WebVTT and TTML/IMSC in HLS and DASH, and CEA-608/708 captions carried in the video.
- `player.addTextTrack(src, language, label)` from code.

```html
<qyro-player src="/film.m3u8">
	<track kind="subtitles" srclang="en" label="English" src="/en.vtt" default />
	<track kind="subtitles" srclang="es" label="Español" src="/es.srt" />
</qyro-player>
```

## What viewers get

- The **CC** button turns captions on and off; <kbd>C</kbd> does the same.
- **Settings → Captions** lists Off, each language, and *Auto* when one matches the device's language.
- **Caption size**, **Caption background** and **Caption color** follow the viewer-preference model from the FCC and WCAG: four sizes, no box / semi-transparent / solid, white or yellow text.
- Choices are remembered in this browser.
- Captions sit above the controls and move up smoothly when the controls show. The cue's own position is kept.

## Things to know

- Caption files on another domain need CORS headers (`Access-Control-Allow-Origin`), because Qyro fetches them.
- `default` on a `<track>` turns it on unless the viewer chose something else before.
