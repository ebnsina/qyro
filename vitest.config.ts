import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

export default defineConfig({
	define: { __VERSION__: JSON.stringify(version) },
	test: { include: ['test/unit/**/*.test.ts', 'site/src/**/*.test.ts'] },
});
