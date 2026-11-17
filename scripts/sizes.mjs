// The one place sizes are measured: the size report, the landing page and the docs read these numbers.
import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { DIST, ENGINE_FILE, ENGINE_SOURCE } from './shaka-engine.mjs';

const gz = (f) => gzipSync(readFileSync(f), { level: 9 }).length;

/** Gzipped bytes: the player alone, the engine it loads, and the script-tag build's own file. */
export function measureSizes() {
	const player = readdirSync(DIST)
		.filter((f) => f.endsWith('.js') && !f.includes('iife') && f != ENGINE_FILE && f != 'seyr.js')
		.reduce((n, f) => n + gz(`${DIST}/${f}`), 0);
	return { player, engine: gz(ENGINE_SOURCE), script: gz(`${DIST}/qyro.iife.js`) };
}
