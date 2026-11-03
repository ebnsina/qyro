---
title: Theming
description: Every --qyro-* custom property, the ::part() hooks, and a live preview.
---

# Theming

Qyro is monochrome glass by default. Change it with CSS custom properties on the element, or on any parent:

```css
qyro-player {
	--qyro-radius: 24px;
	--qyro-accent: #ffd60a;
	--qyro-glass-tint: rgb(10 20 40 / 0.45);
}
```

<!-- preview:theming -->

## Tokens

| Token | Default | What it changes |
| --- | --- | --- |
| `--qyro-font` | Inter, system UI | Text in menus and titles. Qyro loads no fonts; it uses what the page has. |
| `--qyro-font-mono` | Geist Mono, system mono | Times and stats. |
| `--qyro-foreground` | `#fff` | Icons and text. |
| `--qyro-background` | `#000` | Behind the video (letterboxing). |
| `--qyro-accent` | `#fff` | Played part of the seek bar and the volume level. |
| `--qyro-track` | `rgb(255 255 255 / 0.35)` | Unplayed part of the sliders. |
| `--qyro-buffered` | `rgb(255 255 255 / 0.2)` | Buffered part of the seek bar. |
| `--qyro-glass-tint` | `rgb(28 28 32 / 0.36)` | Color laid over the blurred video. |
| `--qyro-glass-blur` | `18px` | How frosted the glass is. |
| `--qyro-glass-saturate` | `180%` | How vivid the video looks through the glass. |
| `--qyro-glass-highlight` | `rgb(255 255 255 / 0.4)` | The bright line on the glass's top edge. |
| `--qyro-glass-rim` | `rgb(255 255 255 / 0.28)` | The hairline rim around the glass. |
| `--qyro-glass-shadow` | soft drop shadow | Depth under the glass. |
| `--qyro-thumb` | `#fff` | The bead on the seek bar and the volume slider. |
| `--qyro-scrim` | `rgb(0 0 0 / 0.7)` | The shade at the bottom that keeps controls readable. |
| `--qyro-radius` | `16px` | Corners of the player. |
| `--qyro-panel-radius` | `14px` | Corners of the settings sheet, menu and panels. |
| `--qyro-control-size` | `38px` | Button size with a mouse. Touch screens always get at least 44px. |
| `--qyro-icon-size` | `18px` | Icon size. |
| `--qyro-inset` | `14px` | Space between the controls and the player's edge. |
| `--qyro-aspect-ratio` | `16 / 9` | The player's shape, e.g. `9 / 16` for vertical video. |
| `--qyro-duration` | `380ms` | Length of the motion. |
| `--qyro-ease` | a soft spring | Easing of the motion. |

`glass="light"` switches to milky glass with dark glyphs.

## Parts

Style any piece directly with `::part()`:

```css
qyro-player::part(big-play-button) {
	width: 96px;
	height: 96px;
}
qyro-player::part(title) {
	font-weight: 700;
}
```

Parts: `root`, `stage`, `video`, `top-bar`, `title`, `big-play-button`, `skip-back-button`, `skip-forward-button`, `spinner`, `controls`, `scrubber`, `track`, `progress`, `thumb`, `preview`, `preview-image`, `time`, `current-time`, `duration`, `live-badge`, `live-badge-corner`, `capsule`, `volume`, `play-button`, `mute-button`, `volume-slider`, `captions-button`, `settings-button`, `pip-button`, `fullscreen-button`, `chapters-button`, `current-chapter`, `chapters`, `settings`, `context-menu`, `stats`, `shortcuts`, `toast`, `error`, `retry-button`.

## Motion

Every animation is opacity, transform or filter, except the volume capsule, which grows in width. With reduced motion turned on in the system, Qyro only fades.
