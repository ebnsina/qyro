# Changelog

All notable changes to Qyro. The format follows [Keep a Changelog](https://keepachangelog.com), and versions follow [Semantic Versioning](https://semver.org).

## [0.1.0] - 2026-10-29

The first version.

### Added

- `<qyro-player>`, a web component that plays HLS, DASH, live streams and MP4 in plain HTML and any framework.
- Liquid glass controls: a thin seek bar with buffered range, a glass bead thumb, a position dot and a time or thumbnail preview; play, volume (the slider grows out of the icon), captions, settings, picture in picture and full screen in floating capsules; times on the seek bar's line that never shift it.
- Settings for quality (Auto shows the current resolution), speed, captions with Auto by device language, caption size, background and color, and audio language. Rows with no real choice are hidden.
- Storyboard thumbnails from a WebVTT sprite (`thumbnails`) or the stream's own image track.
- Captions from `<track>` children (WebVTT, SRT, TTML), from the stream, and from `addTextTrack()`; choices are remembered in the browser.
- Live streams: a LIVE badge (red at the edge, "Go live" behind it), DVR seeking, a corner badge while the controls are hidden, and a message when the stream ends.
- A right-click and long-press menu: play, loop, copy the video URL (also at the current time), picture in picture, stats for nerds, keyboard shortcuts and the version.
- Keyboard shortcuts, screen reader labels and announcements, visible focus, 44px touch targets, tap to show controls, double-tap to skip, and reduced-motion fades.
- Plain error messages with Try again for network, missing, unsupported and protected videos; details go to the `error` event only.
- Theming with `--qyro-*` custom properties, `::part()` hooks and `glass="light"`.
- Opt-in Seyr video analytics with `seyr-key`, loaded only when used.
- A website with docs, ten demo layouts, `llms.txt`, Markdown docs and a Qyro agent skill.
