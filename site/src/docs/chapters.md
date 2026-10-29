---
title: Chapters
description: Split a video into named chapters from a WebVTT file, the stream, or JavaScript, with a Chapters list inside the player.
---

# Chapters

With chapters, the player gets a Chapters button beside captions and settings. It opens a list inside the player (from the right, or from the bottom on phones) with each chapter's start time and title; picking one jumps there and plays. The seek bar has a small gap where each chapter starts, the preview shows the chapter's title above the time, and on a wide player the current chapter's title sits by the current time.

## From a WebVTT file

```html
<qyro-player src="/lesson.m3u8">
	<track kind="chapters" src="/lesson/chapters.vtt" />
</qyro-player>
```

Or as an attribute: `<qyro-player src="/lesson.m3u8" chapters="/lesson/chapters.vtt">`. Relative URLs are read from the page's address. Each cue is one chapter, and its text is the title:

```text
WEBVTT

00:00:00.000 --> 00:01:35.000
Opening: morning in the meadow

00:01:35.000 --> 00:03:25.000
Meet Buck
```

## From the stream

Without a file, Qyro uses the stream's own chapters when it has them.

## From JavaScript

```js
player.chapters = [
	{ start: 0, title: 'Welcome' },
	{ start: 95, title: 'Setting up' },
	{ start: 205, end: 360, title: 'The first lesson' },
];
player.seekToChapter(1);
player.chapter; // { start: 95, title: 'Setting up' } while it plays
player.addEventListener('chapterchange', (e) => highlight(e.detail.index));
```

`end` is optional: a chapter runs until the next one starts. Chapters set this way win over the file and the stream; set `null` to go back to those, or `[]` for none.

## Things to know

- A chapters `<track>` is never offered as captions.
- A file that can't be loaded or isn't WebVTT leaves the video playing without chapters, with a warning in the console.
- Live streams show the Chapters list but no gaps in the bar.
