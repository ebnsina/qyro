// Open movies from the Blender Foundation, each checked to play.
export const media = {
	bbb: {
		title: 'Big Buck Bunny',
		hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
		dash: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
		poster: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
		storyboard: '/media/bbb/storyboard.vtt',
		chapters: '/media/bbb/chapters.vtt',
		credit: 'Big Buck Bunny © Blender Foundation, CC BY 3.0',
	},
	sintel: {
		title: 'Sintel',
		hls: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
		poster: '/media/sintel/poster.jpg',
		credit: 'Sintel © Blender Foundation, CC BY 3.0',
	},
	tos: {
		title: 'Tears of Steel',
		hls: 'https://test-streams.mux.dev/tos_ismc/main.m3u8',
		// A frame at 1:00, where the hero starts, so the poster hands over to the video without a jump.
		poster: '/media/tos/poster.jpg',
		credit: 'Tears of Steel © Blender Foundation, CC BY 3.0',
	},
	live: {
		title: 'Live test stream',
		dash: 'https://livesim2.dashif.org/livesim2/testpic_2s/Manifest.mpd',
		credit: 'Live test signal from the DASH Industry Forum livesim',
	},
};
