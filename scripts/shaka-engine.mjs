// Where the playback engine lives: the one place the build scripts name it. Paths are from the repo root,
// whichever folder the build runs in (the root or site/).
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
export const ENGINE_SOURCE = `${root}node_modules/shaka-player/dist/shaka-player.compiled-es2021.js`;
export const ENGINE_FILE = 'qyro-engine.js';
export const DIST = `${root}dist`;
