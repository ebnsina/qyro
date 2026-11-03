---
title: FAQ
description: Short answers to common questions about Qyro.
---

# FAQ

## Does it work with React, Vue, Svelte or Angular?

Yes. It is a standard custom element. Import `qyro` once, then use `<qyro-player>` like any tag. See [Use with AI](/docs/ai) for framework snippets.

## How big is it?

About 32 kB gzipped for Qyro itself. The playback engine for HLS and DASH loads on demand the first time a player needs it.

## Can I use my own controls?

Hide what you don't want with `::part(...) { display: none }`, and drive the player with its [API](/docs/api).

## Why doesn't autoplay work?

Browsers block autoplay with sound. Add `muted`.

## Why are my captions or thumbnails missing?

Files on another domain need CORS headers. The console names the file that failed.

## Is there tracking?

No. Analytics only exist when you set `seyr-key`, and they go to your own Seyr server.

## What's the licence?

MIT. The bundled playback engine is Apache-2.0; see `licenses/THIRD_PARTY_NOTICES` in the package.
