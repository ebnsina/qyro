---
title: Live
description: Live streams, the LIVE badge, DVR seeking and going back to live.
---

# Live

Point `src` at a live HLS or DASH stream. Qyro finds that it's live, starts at the live edge and shows a **LIVE** badge.

```html
<qyro-player src="https://livesim2.dashif.org/livesim2/testpic_2s/Manifest.mpd" muted autoplay></qyro-player>
```

## The badge

- At the live edge: a red dot that gently pulses, and **Live**. The dot stays still with reduced motion.
- Behind the edge: grey, with how far behind you are, like **-0:42 · Go live**. Clicking it glides back to the edge.
- While the controls are hidden, a small badge stays in the top-left corner, so viewers always know it's live.

## Seeking back (DVR)

When the stream keeps a window of the past, the seek bar covers that window; at the edge its bead sits at the very end. Without a window, the bar hides, the LIVE badge sits next to play, and the seek keys do nothing.

## Details

- There's no speed control on live streams.
- A short stall at the edge shows the spinner, then playback carries on.
- When the stream ends, viewers see "This live stream has ended".
- If the connection drops, the player recovers when the browser is back online.
- Stats for nerds shows the **Live delay**.
