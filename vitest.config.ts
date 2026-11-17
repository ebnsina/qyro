import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import { ENGINE_FILE } from './scripts/shaka-engine.mjs';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

export default defineConfig({
	define: { __VERSION__: JSON.stringify(version), __SCRIPT__: 'false', __ENGINE_FILE__: JSON.stringify(ENGINE_FILE) },
	test: { include: ['test/unit/**/*.test.ts', 'site/src/**/*.test.ts'] },
});
