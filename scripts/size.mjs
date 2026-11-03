// Prints gzipped sizes: Qyro alone (what your bundle adds), the engine it loads on demand, and the
// script-tag build (qyro.iife.js up front, qyro-engine.js on first play).
import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { ENGINE_SOURCE, ENGINE_FILE, DIST } from './shaka-engine.mjs';

const gz = (f) => gzipSync(readFileSync(f), { level: 9 }).length;
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const own = readdirSync(DIST).filter((f) => f.endsWith('.js') && !f.includes('iife') && f != ENGINE_FILE && f != 'seyr.js');
const qyro = own.reduce((n, f) => n + gz(`${DIST}/${f}`), 0);
const engine = gz(ENGINE_SOURCE);
console.log(`Qyro (${own.join(' + ')}): ${kb(qyro)} gzipped`);
console.log(`Playback engine, loaded on first play: ${kb(engine)} gzipped`);
console.log(`Total with the engine: ${kb(qyro + engine)} gzipped`);
console.log(`Script tag build (${DIST}/qyro.iife.js): ${kb(gz(`${DIST}/qyro.iife.js`))} gzipped, engine dist/${ENGINE_FILE}, fetched beside it: ${kb(gz(`${DIST}/${ENGINE_FILE}`))} gzipped`);
console.log(`Seyr entry (dist/seyr.js): ${kb(gz(`${DIST}/seyr.js`))} gzipped`);
