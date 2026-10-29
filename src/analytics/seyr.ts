import type { Engine } from '../engine/shaka.js';

/** The slice of @seyr/video that Qyro calls (see the Seyr video SDK's public API). */
export interface SeyrVideo {
	monitor(adapter: unknown, options: SeyrOptions): SeyrView;
	shaka(player: Engine, video?: HTMLVideoElement): unknown;
}

export interface SeyrMeta {
	id: string;
	title?: string;
	series?: string;
}

export interface SeyrOptions {
	key: string;
	host?: string;
	video: SeyrMeta;
	player: { name: string; software: string; version: string };
}

export interface SeyrView {
	change(o: { video: SeyrMeta }): void;
	destroy(): void;
}

type Loader = () => Promise<SeyrVideo>;

let loader: Loader | undefined;

/** Set by `qyro/seyr`, which imports @seyr/video from npm through your bundler. */
export function useSeyrLoader(l: Loader): void {
	loader = l;
}

declare global {
	interface Window {
		seyrVideo?: SeyrVideo;
	}
}

/**
 * Finds the SDK: the npm loader if `qyro/seyr` was imported, a page that already has
 * `window.seyrVideo`, or else the script your Seyr server serves at `<host>/js/seyr-video.js`.
 */
export async function loadSeyr(host: string | undefined): Promise<SeyrVideo> {
	if (loader) return loader();
	if (window.seyrVideo) return window.seyrVideo;
	if (!host) throw new Error('qyro: seyr-key is set, but there is no seyr-host to load the Seyr video script from and qyro/seyr was not imported');
	await script(`${host.replace(/\/$/, '')}/js/seyr-video.js`);
	if (!window.seyrVideo) throw new Error(`qyro: ${host}/js/seyr-video.js loaded but did not define window.seyrVideo`);
	return window.seyrVideo;
}

const scripts = new Map<string, Promise<void>>();

function script(src: string): Promise<void> {
	let p = scripts.get(src);
	if (!p) {
		p = new Promise((resolve, reject) => {
			const s = document.createElement('script');
			s.src = src;
			s.async = true;
			s.onload = () => resolve();
			s.onerror = () => {
				scripts.delete(src);
				reject(new Error(`qyro: couldn't load the Seyr video script from ${src}`));
			};
			document.head.append(s);
		});
		scripts.set(src, p);
	}
	return p;
}
