import { expect, test, type Locator, type Page } from '@playwright/test';
import pkg from '../../package.json' with { type: 'json' };

async function open(page: Page, params = ''): Promise<Locator> {
	await page.goto(`/playground/index.html?src=/test/fixtures/hls/main.m3u8&muted${params}`);
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => !!p.engine && p.video.readyState >= 1)).toBe(true);
	return player;
}

const isOpen = (player: Locator) => player.evaluate((p: any) => p.shadowRoot.querySelector('.root').hasAttribute('data-menu'));

test('right click opens the glass menu with every item and the version last', async ({ page }) => {
	const player = await open(page);
	const box = (await player.boundingBox())!;
	await page.mouse.click(box.x + 200, box.y + 150, { button: 'right' });
	const menu = player.locator('.menu');
	await expect(menu.getByRole('menuitem')).toHaveText(['Play', 'Copy video URL', 'Copy URL at current time', 'Picture in picture', 'Keyboard shortcuts']);
	await expect(menu.getByRole('menuitemcheckbox')).toHaveText(['Loop', 'Stats for nerds']);
	await expect(menu.locator('.menu-foot')).toHaveText(`Qyro Player v${pkg.version}`);
	await expect(menu.getByRole('menuitem').first()).toBeFocused();
	// Clicking elsewhere in the player closes it without toggling play.
	await page.mouse.click(box.x + 600, box.y + 300);
	await expect.poll(() => isOpen(player)).toBe(false);
	expect(await player.evaluate((p: any) => p.paused)).toBe(true);
});

test('stays inside the player when opened at the bottom right corner', async ({ page }) => {
	const player = await open(page);
	const box = (await player.boundingBox())!;
	await page.mouse.click(box.x + box.width - 5, box.y + box.height - 5, { button: 'right' });
	await page.waitForTimeout(500);
	const menu = (await player.locator('.menu').boundingBox())!;
	expect(menu.x).toBeGreaterThanOrEqual(box.x);
	expect(menu.y).toBeGreaterThanOrEqual(box.y);
	expect(menu.x + menu.width).toBeLessThanOrEqual(box.x + box.width);
	expect(menu.y + menu.height).toBeLessThanOrEqual(box.y + box.height);
});

test('keyboard: Shift+F10 opens, arrows move, Enter runs, Escape closes', async ({ page }) => {
	const player = await open(page);
	await player.focus();
	await page.keyboard.press('Shift+F10');
	await expect.poll(() => isOpen(player)).toBe(true);
	await page.keyboard.press('ArrowDown');
	await expect(player.getByRole('menuitemcheckbox', { name: 'Loop' })).toBeFocused();
	await page.keyboard.press('Enter');
	expect(await player.evaluate((p: any) => p.loop && p.video.loop)).toBe(true);
	await expect.poll(() => isOpen(player)).toBe(false);
	await page.keyboard.press('ContextMenu');
	await expect.poll(() => isOpen(player)).toBe(true);
	await page.keyboard.press('Escape');
	await expect.poll(() => isOpen(player)).toBe(false);
	expect(await player.evaluate((p: any) => p.paused)).toBe(true);
});

test('copies the video URL, and the URL at the current time that plays from there', async ({ page, context, browserName }) => {
	test.skip(browserName == 'webkit', "Playwright's WebKit can't grant clipboard permissions");
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	const player = await open(page, '&start=4');
	const box = (await player.boundingBox())!;
	await page.mouse.click(box.x + 200, box.y + 150, { button: 'right' });
	await player.getByRole('menuitem', { name: 'Copy URL at current time' }).click();
	await expect(player.locator('.toast')).toHaveText('Link copied');
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied).toBe('http://localhost:5311/test/fixtures/hls/main.m3u8#t=4');
	await player.evaluate((p: any, url: string) => (p.src = url.replace('#t=4', '#t=7')), copied);
	await expect.poll(() => player.evaluate((p: any) => Math.floor(p.currentTime))).toBe(7);
});

test('stats for nerds shows live numbers from Shaka', async ({ page }) => {
	const player = await open(page);
	await player.locator('.big-play').click();
	const box = (await player.boundingBox())!;
	await page.mouse.click(box.x + 200, box.y + 150, { button: 'right' });
	await player.getByRole('menuitemcheckbox', { name: 'Stats for nerds' }).click();
	const stats = player.getByRole('dialog', { name: 'Stats for nerds' });
	await expect(stats).toBeVisible();
	await expect(stats.locator('dt')).toHaveText(['Resolution', 'Bitrate', 'Connection speed', 'Buffer', 'Dropped frames', 'Codec']);
	await expect(stats.locator('dd').first()).toHaveText(/\d+×\d+/);
	await expect(stats.locator('dd').nth(1)).toHaveText(/kbps|Mbps/);
	await expect(stats).not.toContainText(/shaka/i);
	await stats.getByRole('button', { name: 'Close stats' }).click();
	await expect(stats).toBeHidden();
});

test('the shortcuts panel opens from the menu and with ?', async ({ page }) => {
	const player = await open(page);
	await player.focus();
	await page.keyboard.press('Shift+?');
	const keys = player.getByRole('dialog', { name: 'Keyboard shortcuts' });
	await expect(keys).toBeVisible();
	await expect(keys.locator('dt').first()).toHaveText('Space / K');
	await page.keyboard.press('Escape');
	await expect(keys).toBeHidden();
});

