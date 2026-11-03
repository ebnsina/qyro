import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { ENGINE_FILE } from './scripts/shaka-engine.mjs';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

// `vite build` makes the ESM package (Shaka left to your bundler); `--mode script` makes qyro.iife.js for a
// <script> tag, which fetches qyro-engine.js (Shaka, copied by scripts/engine.mjs) on first play.
export default defineConfig(({ mode }) => {
	const script = mode == 'script';
	return {
		define: { __VERSION__: JSON.stringify(version), __SCRIPT__: JSON.stringify(script), __ENGINE_FILE__: JSON.stringify(ENGINE_FILE) },
		build: {
			target: 'es2022',
			emptyOutDir: !script,
			sourcemap: true,
			minify: true,
			lib: script
				? { entry: 'src/index.ts', name: 'Qyro', formats: ['iife'], fileName: () => 'qyro.iife.js' }
				: { entry: { qyro: 'src/index.ts', seyr: 'src/seyr.ts' }, formats: ['es'] },
			rolldownOptions: script
				? {
						output: {
							// The one place, besides licenses/THIRD_PARTY_NOTICES, where the bundled engine is named: its licence requires it.
							postBanner: `/*! Qyro ${version} | MIT | https://github.com/ebnsina/qyro\n * Loads Shaka Player from qyro-engine.js, Copyright 2016 Google LLC, Apache-2.0 (see licenses/THIRD_PARTY_NOTICES) */`,
						},
					}
				: { external: [/^shaka-player/, /^@seyr\/video/], output: { minify: true } },
		},
	};
});
