import { expect, test } from '@playwright/test';

// A public DASH live simulator with a DVR window. This suite needs the network on purpose.
const LIVE = 'https://livesim2.dashif.org/livesim2/testpic_2s/Manifest.mpd';

test.skip(({ isMobile }) => isMobile, 'live UI is the same on touch');

test('live: red at the edge, "Go live" behind it, and back to the edge', async ({ page }) => {
	await page.goto(`/dev/index.html?muted&autoplay&src=${encodeURIComponent(LIVE)}`);
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => p.live && !p.paused), { timeout: 30000 }).toBe(true);
	const live = player.locator('.timeline .live');
	const root = () => player.evaluate((p: any) => p.shadowRoot.querySelector('.root').hasAttribute('data-at-live'));
	await expect.poll(root, { timeout: 15000 }).toBe(true);
	await expect(live).toContainText('Live');
	await expect(live.locator('.dot')).toHaveCSS('background-color', 'rgb(255, 59, 48)');
	await expect(player.locator('.duration')).toBeHidden();
	expect(await player.evaluate((p: any) => p.duration)).toBe(Infinity);

	await player.evaluate((p: any) => p.seek(p.currentTime - 25));
	await expect.poll(root).toBe(false);
	await expect(live).toContainText('Go live');
	await expect(live.locator('.dot')).not.toHaveCSS('background-color', 'rgb(255, 59, 48)');
	await expect(player.locator('.current')).toHaveText(/^-0:2\d$/);

	await live.click();
	await expect.poll(root, { timeout: 15000 }).toBe(true);
	await expect(live).toContainText('Live');
	await expect(player.locator('.current')).toHaveText('');

	// With the controls hidden, the corner pill still says live.
	const box = (await player.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y - 40);
	const corner = player.locator('.live-corner');
	await expect(corner).toHaveCSS('opacity', '1', { timeout: 8000 });
	await expect(corner).toContainText('Live');
	await expect(corner.locator('.dot')).toHaveCSS('background-color', 'rgb(255, 59, 48)');
});

test('live: the corner pill shows on the poster before playback', async ({ page }) => {
	await page.goto(`/dev/index.html?muted&src=${encodeURIComponent(LIVE)}`);
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => p.live), { timeout: 30000 }).toBe(true);
	await expect(player.locator('.live-corner')).toHaveCSS('opacity', '1');
});

test('live: no speed control, and stats show the live delay', async ({ page }) => {
	await page.goto(`/dev/index.html?muted&autoplay&src=${encodeURIComponent(LIVE)}`);
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => p.live && !p.paused), { timeout: 30000 }).toBe(true);
	await player.locator('.gear').click();
	await expect(player.getByRole('menuitem', { name: /Speed/ })).toHaveCount(0);
	await page.keyboard.press('Escape');
	const box = (await player.boundingBox())!;
	await page.mouse.click(box.x + 200, box.y + 150, { button: 'right' });
	await player.getByRole('menuitemcheckbox', { name: 'Stats for nerds' }).click();
	await expect(player.getByRole('dialog', { name: 'Stats for nerds' }).locator('dt').last()).toHaveText('Live delay');
});
