---
title: Thumbnails
description: Show frames in the seek preview with a WebVTT storyboard or the stream's own image track.
---

# Thumbnails

Hovering or dragging on the seek bar shows the time, a dot where you are pointing, and, when the video has one, a thumbnail of that moment.

## A WebVTT storyboard

```html
<qyro-player src="/film.m3u8" thumbnails="/film/storyboard.vtt"></qyro-player>
```

The VTT lists one image per time range. Images can be tiles of one sprite, with `#xywh=x,y,width,height`, or whole pictures. Relative URLs are read from the VTT's own address.

```text
WEBVTT

00:00:00.000 --> 00:00:05.000
storyboard.jpg#xywh=0,0,160,90

00:00:05.000 --> 00:00:10.000
storyboard.jpg#xywh=160,0,160,90
```

The repository has `scripts/storyboard.sh` to make one with ffmpeg:

```shell
scripts/storyboard.sh film.mp4 public/film 5
```

## From the stream

Without the attribute, Qyro uses the stream's own thumbnails: DASH thumbnail tracks and HLS image playlists.

## Things to know

- Sprites on another domain need CORS headers for the VTT; the images themselves don't.
- Images load once and stay cached, so moving along the bar never flickers.
