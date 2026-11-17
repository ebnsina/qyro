import type shakaNamespace from 'shaka-player/dist/shaka-player.compiled-es2021.js';
import { loadScript } from '../load-script.js';

export type Shaka = typeof shakaNamespace;
/** The playback engine behind <qyro-player>, exposed as `player.engine` for advanced use. */
export type Engine = shakaNamespace.Player;

declare const __SCRIPT__: boolean;
declare const __ENGINE_FILE__: string;

// Script build only: the engine ships as __ENGINE_FILE__ beside qyro.iife.js (see scripts/shaka-engine.mjs).
const scriptUrl = __SCRIPT__ ? (document.currentScript as HTMLScriptElement | null)?.src : undefined;

let loading: Promise<Shaka> | undefined;

/** Loads Shaka once per page, on first use, so defining <qyro-player> costs nothing until one plays. */
export function loadShaka(): Promise<Shaka> {
	loading ??= engine().then((shaka) => {
		shaka.polyfill.installAll();
		// Viewers never see engine internals, and that includes the console.
		(shaka as { log?: { setLevel?(l: number): void; Level?: { NONE: number } } }).log?.setLevel?.(0);
		return shaka;
	});
	return loading;
}

function engine(): Promise<Shaka> {
	if (!__SCRIPT__) {
		return import('shaka-player/dist/shaka-player.compiled-es2021.js').then((m) => ((m as { default?: Shaka }).default ?? m) as Shaka);
	}
	// A page that already loads Shaka keeps its copy; otherwise the engine file beside this script.
	const existing = (window as { shaka?: Shaka }).shaka;
	if (existing) return Promise.resolve(existing);
	if (!scriptUrl) return Promise.reject(new Error(`qyro: the playback engine can't be found; serve ${__ENGINE_FILE__} next to qyro.iife.js, or load Shaka Player first`));
	const url = new URL(__ENGINE_FILE__, scriptUrl).href;
	return loadScript(url, 'the playback engine').then(() => {
		const shaka = (window as { shaka?: Shaka }).shaka;
		if (!shaka) throw new Error(`qyro: ${url} loaded but did not define window.shaka`);
		return shaka;
	});
}

/** A Shaka player on `video`, rendering captions into `container` so they can be styled and moved. */
export async function createPlayer(shaka: Shaka, video: HTMLVideoElement, container: HTMLElement): Promise<Engine> {
	const player = new shaka.Player();
	// Set before attach, or Shaka falls back to the browser's own caption rendering.
	player.setVideoContainer(container);
	await player.attach(video);
	return player;
}
