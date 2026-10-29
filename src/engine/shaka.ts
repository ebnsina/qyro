import type shakaNamespace from 'shaka-player/dist/shaka-player.compiled-es2021.js';

export type Shaka = typeof shakaNamespace;
/** The playback engine behind <qyro-player>, exposed as `player.engine` for advanced use. */
export type Engine = shakaNamespace.Player;

let loading: Promise<Shaka> | undefined;

/** Loads Shaka once per page, on first use, so defining <qyro-player> costs nothing until one plays. */
export function loadShaka(): Promise<Shaka> {
	loading ??= import('shaka-player/dist/shaka-player.compiled-es2021.js').then((m) => {
		const shaka = ((m as { default?: Shaka }).default ?? m) as Shaka;
		shaka.polyfill.installAll();
		// Viewers never see engine internals, and that includes the console.
		(shaka as { log?: { setLevel?(l: number): void; Level?: { NONE: number } } }).log?.setLevel?.(0);
		return shaka;
	});
	return loading;
}

/** A Shaka player on `video`, rendering captions into `container` so they can be styled and moved. */
export async function createPlayer(shaka: Shaka, video: HTMLVideoElement, container: HTMLElement): Promise<Engine> {
	const player = new shaka.Player();
	// Set before attach, or Shaka falls back to the browser's own caption rendering.
	player.setVideoContainer(container);
	await player.attach(video);
	return player;
}
