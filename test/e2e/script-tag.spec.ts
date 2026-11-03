import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { ENGINE_FILE } from '../../scripts/shaka-engine.mjs';

// The single-file build, as a plain <script> tag on a page with no bundler (needs `pnpm build` first).
test('the script-tag build defines and upgrades <qyro-player> with no errors', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.setContent('<!doctype html><qyro-player title="Plain"></qyro-player>');
	await page.addScriptTag({ path: 'dist/qyro.iife.js' });
	const upgraded = await page.evaluate(() => !!customElements.get('qyro-player') && !!document.querySelector('qyro-player')?.shadowRoot);
	expect(upgraded).toBe(true);
	expect(errors).toEqual([]);
});

// The engine is a separate file beside the script, so the script itself stays small.
test('the script-tag build fetches the engine file beside it, once, when a player starts', async ({ page }) => {
	const errors: string[] = [];
	const engineRequests: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.route('**/__script/**', (route) => {
		const name = new URL(route.request().url()).pathname.split('/').pop()!;
		if (name == ENGINE_FILE) engineRequests.push(name);
		const files: Record<string, { body: string | Buffer; type: string }> = {
			'index.html': { body: '<!doctype html><script src="qyro.iife.js"></script><qyro-player muted></qyro-player>', type: 'text/html' },
			'qyro.iife.js': { body: readFileSync('dist/qyro.iife.js'), type: 'text/javascript' },
			[ENGINE_FILE]: { body: readFileSync(`dist/${ENGINE_FILE}`), type: 'text/javascript' },
		};
		const file = files[name];
		return file ? route.fulfill({ body: file.body, contentType: file.type }) : route.fulfill({ status: 404 });
	});
	await page.goto('/__script/index.html');
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => !!p.shadowRoot)).toBe(true);
	await player.evaluate((p: any) => (p.src = '/test/fixtures/hls/main.m3u8'));
	await player.locator('.big-play').click();
	await expect.poll(() => player.evaluate((p: any) => p.currentTime)).toBeGreaterThan(0.3);
	expect(engineRequests).toEqual([ENGINE_FILE]);
	expect(errors).toEqual([]);
});
