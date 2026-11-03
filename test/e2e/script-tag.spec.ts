import { expect, test } from '@playwright/test';

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
