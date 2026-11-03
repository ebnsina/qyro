import { readFileSync } from 'node:fs';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defaultClientConditions, defaultServerConditions, defineConfig } from 'vite';
import { ENGINE_FILE } from '../scripts/shaka-engine.mjs';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

export default defineConfig({
	define: { __VERSION__: JSON.stringify(version), __SCRIPT__: 'false', __ENGINE_FILE__: JSON.stringify(ENGINE_FILE), __SITE_URL__: JSON.stringify(process.env.SITE_URL ?? 'https://ebnsina.github.io/qyro') },
	// The "source" export condition plays the player straight from the library's TypeScript.
	resolve: { conditions: ['source', ...defaultClientConditions] },
	ssr: { resolve: { conditions: ['source', ...defaultServerConditions] } },
	server: { fs: { allow: ['..'] } },
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
			},
			// GitHub Pages serves 404.html for unknown paths, so the brand's not-found page is what visitors see.
			adapter: adapter({ strict: true, fallback: '404.html' }),
			paths: { base: (process.env.BASE_PATH ?? '') as '' },
			prerender: { handleHttpError: 'fail' },
		}),
	],
});
