---
title: Analytics
description: Opt-in, privacy-friendly video analytics with Seyr. Off unless you turn it on.
---

# Analytics

Qyro has no analytics code until you ask for it. Set `seyr-key` to send playback quality and engagement to your own [Seyr](https://github.com/ebnsina/seyr) server: startup time, rebuffering, quality, errors and watch time. No third-party tracker is ever involved.

```html
<qyro-player
	src="/episode-12.m3u8"
	seyr-key="your-project-key"
	seyr-host="https://analytics.example.com"
	video-id="ep-12"
	title="Episode 12"
	series="The Show"
></qyro-player>
```

`video-id` is required with `seyr-key`; without it, the video isn't tracked and the console says why.

## How the Seyr code is loaded

Qyro looks for the Seyr video SDK in this order:

1. **From npm, through your bundler.** Install `@seyr/video` and import Qyro's Seyr entry once:

   ```shell
   npm install @seyr/video
   ```

   ```js
   import '@ebnsina/qyro';
   import '@ebnsina/qyro/seyr';
   ```

   Your bundler puts the SDK in its own chunk, fetched only by players that have `seyr-key`.
2. **Already on the page**, as `window.seyrVideo`.
3. **From your Seyr server**: `<seyr-host>/js/seyr-video.js`, loaded on demand. This is the script-tag route and needs nothing installed.

Views are reported with the player name `Qyro` and software `qyro`. Each video is one view. Changing `src` starts a new view for the new video (set `video-id` at the same time), and removing the player ends it. Live streams are reported as live.

If the SDK can't load, the video plays on and the console says what went wrong.
