// Prints the gzipped sizes in decimal kB, the unit the site and README use.
import { measureSizes } from './sizes.mjs';

const kb = (bytes) => `${(bytes / 1000).toFixed(1)} kB`;
const { player, engine, script } = measureSizes();
console.log(`Qyro alone: ${kb(player)} gzipped`);
console.log(`Playback engine, loaded when the first player starts: ${kb(engine)} gzipped`);
console.log(`Total with the engine: ${kb(player + engine)} gzipped`);
console.log(`Script tag build (dist/qyro.iife.js) up front: ${kb(script)} gzipped; the engine is dist/qyro-engine.js, fetched beside it`);
