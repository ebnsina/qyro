// Prints gzipped sizes: Qyro alone (what your bundle adds), the engine it loads on demand, and the
// single-file script build with everything inside.
import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const gz = (f) => gzipSync(readFileSync(f), { level: 9 }).length;
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const own = readdirSync('dist').filter((f) => f.endsWith('.js') && !f.includes('iife') && f != 'seyr.js');
const qyro = own.reduce((n, f) => n + gz(`dist/${f}`), 0);
const engine = gz('node_modules/shaka-player/dist/shaka-player.compiled-es2021.js');
console.log(`Qyro (${own.join(' + ')}): ${kb(qyro)} gzipped`);
console.log(`Playback engine, loaded on first play: ${kb(engine)} gzipped`);
console.log(`Total with the engine: ${kb(qyro + engine)} gzipped`);
console.log(`Script tag build (dist/qyro.iife.js): ${kb(gz('dist/qyro.iife.js'))} gzipped`);
console.log(`Seyr entry (dist/seyr.js): ${kb(gz('dist/seyr.js'))} gzipped`);
