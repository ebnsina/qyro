import { asset, resolve } from '$app/paths';

// Every link goes through here, so the site works under a base path (BASE_PATH at build time).
export const to = (path: string) => resolve(path as '/');
export const file = (path: string) => asset(path as never);

export const GITHUB = 'https://github.com/ebnsina/qyro';
// Where the site is served, without the base path (GitHub Pages until a deploy target is chosen).
export const SITE = 'https://ebnsina.github.io';

declare const __SITE_URL__: string;
/** The public site's full address for links read elsewhere (llms.txt, prompts); SITE_URL at build time. */
export const SITE_URL = __SITE_URL__;

// Open movies from the Blender Foundation, each checked to play.
export const media = {
	bbb: {
		title: 'Big Buck Bunny',
		hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
		dash: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
		poster: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
		storyboard: '/media/bbb/storyboard.vtt',
		credit: 'Big Buck Bunny © Blender Foundation, CC BY 3.0',
	},
	sintel: {
		title: 'Sintel',
		hls: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
		credit: 'Sintel © Blender Foundation, CC BY 3.0',
	},
	tos: {
		title: 'Tears of Steel',
		hls: 'https://test-streams.mux.dev/tos_ismc/main.m3u8',
		credit: 'Tears of Steel © Blender Foundation, CC BY 3.0',
	},
	live: {
		title: 'Live test stream',
		dash: 'https://livesim2.dashif.org/livesim2/testpic_2s/Manifest.mpd',
		credit: 'Live test signal from the DASH Industry Forum livesim',
	},
};
