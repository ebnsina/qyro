import type { Engine } from '../engine/shaka.js';
import { loadScript } from '../load-script.js';

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

/** Set by `@ebnsina/qyro/seyr`, which imports @seyr/video from npm through your bundler. */
export function useSeyrLoader(l: Loader): void {
	loader = l;
}

declare global {
	interface Window {
		seyrVideo?: SeyrVideo;
	}
}

/**
 * Finds the SDK: the npm loader if `@ebnsina/qyro/seyr` was imported, a page that already has
 * `window.seyrVideo`, or else the script your Seyr server serves at `<host>/js/seyr-video.js`.
 */
export async function loadSeyr(host: string | undefined): Promise<SeyrVideo> {
	if (loader) return loader();
	if (window.seyrVideo) return window.seyrVideo;
	if (!host) throw new Error('qyro: seyr-key is set, but there is no seyr-host to load the Seyr video script from and @ebnsina/qyro/seyr was not imported');
	await loadScript(`${host.replace(/\/$/, '')}/js/seyr-video.js`, 'the Seyr video script');
	if (!window.seyrVideo) throw new Error(`qyro: ${host}/js/seyr-video.js loaded but did not define window.seyrVideo`);
	return window.seyrVideo;
}
