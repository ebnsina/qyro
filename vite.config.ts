import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

// `vite build` makes the ESM package (Shaka left to your bundler); `--mode script` makes one
// self-contained file for a <script> tag, with Shaka inside.
export default defineConfig(({ mode }) => {
	const script = mode == 'script';
	return {
		define: { __VERSION__: JSON.stringify(version) },
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
							// The one place, besides THIRD_PARTY_NOTICES, where the bundled engine is named: its licence requires it.
							postBanner: `/*! Qyro ${version} | MIT | https://github.com/ebnsina/qyro\n * Includes Shaka Player, Copyright 2016 Google LLC, Apache-2.0 (see THIRD_PARTY_NOTICES) */`,
						},
					}
				: { external: [/^shaka-player/, /^@seyr\/video/], output: { minify: true } },
		},
	};
});
