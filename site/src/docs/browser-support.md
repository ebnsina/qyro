---
title: Browser support
description: Where Qyro plays, and what changes on iPhone, iPad and Android.
---

# Browser support

Qyro supports the current and previous major versions of Chrome, Edge, Firefox and Safari, on desktop, iOS, iPadOS and Android.

| | HLS | DASH | MP4 |
| --- | --- | --- | --- |
| Chrome, Edge, Firefox (desktop, Android) | Yes | Yes | Yes |
| Safari 17.1+ (macOS, iPadOS, iOS) | Yes | Yes | Yes |
| Safari before 17.1 on iPhone | Yes, through Safari's own player | No | Yes |

## iPhone and iPad

- **Full screen**: iPhone only allows the video itself to go full screen, so it uses Safari's own full-screen controls. iPad keeps Qyro's controls.
- **Volume**: iPhone and iPad set volume with the hardware buttons, so the slider is hidden on touch screens; mute still works.
- **Autoplay** needs `muted`. Qyro plays inline by default, so `playsinline` is already on.
- **Picture in picture** works on both.

## Android

- Full screen turns the phone sideways for landscape videos.
- The back gesture leaves full screen.
- Long-press opens Qyro's menu, not the system one.

## Glass

Browsers without `backdrop-filter` get solid tinted panels instead of glass.
