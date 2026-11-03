import { expect, test } from '@playwright/test';

// Local live streams from scripts/live.sh, started by playwright.config.ts: a 5-minute DVR window, and no DVR.
const LIVE = '/test/generated/live/index.m3u8';
const NO_DVR = '/test/generated/live-no-dvr/index.m3u8';

test.skip(({ isMobile }) => isMobile, 'live UI is the same on touch');

test('live: red at the edge, "Go live" behind it, and back to the edge', async ({ page }) => {
	test.setTimeout(90000); // the DVR window fills in real time, about 40s from the stream's start
	await page.goto(`/test/harness/index.html?muted&autoplay&src=${encodeURIComponent(LIVE)}`);
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => p.live && !p.paused), { timeout: 30000 }).toBe(true);
	const live = player.locator('.timeline .live');
	const root = () => player.evaluate((p: any) => p.shadowRoot.querySelector('.root').hasAttribute('data-at-live'));
	await expect.poll(root, { timeout: 15000 }).toBe(true);
	// The seek back needs a DVR window of at least 30s; the stream has to run for a while first.
	await expect.poll(() => player.evaluate((p: any) => { const r = p.engine.seekRange(); return r.end - r.start; }), { timeout: 60000 }).toBeGreaterThanOrEqual(40);
	await expect(live).toContainText('Live');
	await expect(live.locator('.dot')).toHaveCSS('background-color', 'rgb(255, 59, 48)');
	await expect(player.locator('.duration')).toBeHidden();
	expect(await player.evaluate((p: any) => p.duration)).toBe(Infinity);

	await player.evaluate((p: any) => p.seek(p.currentTime - 25));
	await expect.poll(root).toBe(false);
	await expect(live).toContainText('Go live');
	await expect(live.locator('.dot')).not.toHaveCSS('background-color', 'rgb(255, 59, 48)');
	await expect(live).toContainText(/-0:2\d · Go live/);
	await expect(player.locator('.current')).toBeHidden();
	await page.waitForTimeout(400); // let the pill finish growing
	const wide = (await live.boundingBox())!.width;

	await player.hover(); // wake the controls if they hid while we waited
	await live.click();
	await expect.poll(root, { timeout: 15000 }).toBe(true);
	await expect(live).toHaveText('Live');
	// At the edge, the bead sits at the very end of the bar (after its glide there).
	await page.waitForTimeout(900);
	const [bar, bead] = await Promise.all([player.locator('.scrubber').boundingBox(), player.locator('.scrubber .thumb').boundingBox()]);
	expect(Math.abs(bead!.x + bead!.width / 2 - (bar!.x + bar!.width))).toBeLessThan(3);
	// The pill shrank back to fit "Live", and its animation left no fixed width behind.
	expect((await live.boundingBox())!.width).toBeLessThan(wide - 20);
	expect(await live.evaluate((e) => (e as HTMLElement).style.width)).toBe('');

	// With the controls hidden, the corner pill still says live.
	const box = (await player.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y - 40);
	const corner = player.locator('.live-corner');
	await expect(corner).toHaveCSS('opacity', '1', { timeout: 8000 });
	await expect(corner).toContainText('Live');
	await expect(corner.locator('.dot')).toHaveCSS('background-color', 'rgb(255, 59, 48)');
});

test('live: the corner pill shows on the poster before playback', async ({ page }) => {
	await page.goto(`/test/harness/index.html?muted&src=${encodeURIComponent(LIVE)}`);
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => p.live), { timeout: 30000 }).toBe(true);
	await expect(player.locator('.live-corner')).toHaveCSS('opacity', '1');
});

test('live: no speed control, and stats show the live delay', async ({ page }) => {
	await page.goto(`/test/harness/index.html?muted&autoplay&src=${encodeURIComponent(LIVE)}`);
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

test('live without a DVR window: no bar, and the LIVE pill sits beside play', async ({ page }) => {
	await page.goto(`/test/harness/index.html?muted&autoplay&src=${encodeURIComponent(NO_DVR)}`);
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => p.live && !p.paused), { timeout: 30000 }).toBe(true);
	await expect(player.locator('.timeline')).toBeHidden();
	await expect(player.locator('.row .live-row')).toBeVisible();
	await expect(player.locator('.row .live-row')).toHaveText('Live');
	await expect(player.locator('.row .live-row .dot')).toHaveCSS('background-color', 'rgb(255, 59, 48)');
	await player.focus();
	await page.keyboard.press('ArrowLeft');
	await expect(player.locator('.sr')).toHaveText('This live stream can’t be rewound');
});
