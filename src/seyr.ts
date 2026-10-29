// Import this entry to load Seyr video analytics from npm (@seyr/video) instead of from your Seyr server.
// Your bundler splits it into its own chunk, fetched only when a player has seyr-key.
import { useSeyrLoader } from './analytics/seyr.js';

useSeyrLoader(async () => {
	const [core, adapter] = await Promise.all([import('@seyr/video'), import('@seyr/video/shaka')]);
	return { monitor: core.monitor as never, shaka: adapter.shaka as never };
});
