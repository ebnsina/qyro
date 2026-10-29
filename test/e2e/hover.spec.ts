import { expect, test, type Locator, type Page } from '@playwright/test';

// Interactions that must not collapse or hide halfway through: hover zones, drags, menus.

async function playing(page: Page): Promise<Locator> {
	await page.goto('/dev/index.html?src=/test/fixtures/hls/main.m3u8&muted&loop');
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => !!p.engine && p.video.readyState >= 1)).toBe(true);
	await player.locator('.big-play').click();
	await expect.poll(() => player.evaluate((p: any) => !p.paused)).toBe(true);
	await page.waitForTimeout(450); // the controls rise into place as playback starts
	return player;
}

const idle = (player: Locator) => player.evaluate((p: any) => p.shadowRoot.querySelector('.root').hasAttribute('data-idle'));

async function glide(page: Page, from: { x: number; y: number }, to: { x: number; y: number }, steps = 12) {
	await page.mouse.move(from.x, from.y);
	await page.mouse.move(to.x, to.y, { steps });
}

const center = (b: { x: number; y: number; width: number; height: number }) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

test('volume: the slider stays open moving up from the icon, and while dragging outside the player', async ({ page }) => {
	const player = await playing(page);
	const mute = (await player.locator('.mute').boundingBox())!;
	await page.mouse.move(...(Object.values(center(mute)) as [number, number]));
	const panel = player.locator('.volume-pop');
	await expect(panel).toHaveCSS('opacity', '1');
	const slider = (await player.locator('.volume-slider').boundingBox())!;
	// Up and to the right, through the gap between the icon and the panel.
	await glide(page, center(mute), { x: slider.x + slider.width * 0.9, y: slider.y + slider.height / 2 }, 20);
	await page.waitForTimeout(500);
	await expect(player.locator('.volume')).toHaveAttribute('data-open', '');
	// Drag from the right end to a quarter, then out past the top of the player, then release.
	await page.mouse.down();
	await page.mouse.move(slider.x + slider.width * 0.25, slider.y + slider.height / 2, { steps: 8 });
	await page.mouse.move(slider.x + slider.width * 0.25, 2, { steps: 8 });
	await page.waitForTimeout(3200);
	await expect(player.locator('.volume')).toHaveAttribute('data-open', '');
	expect(await idle(player)).toBe(false);
	await page.mouse.up();
	const volume = await player.evaluate((p: any) => p.volume);
	expect(volume).toBeGreaterThan(0.1);
	expect(volume).toBeLessThan(0.45);
	expect(await player.evaluate((p: any) => p.paused)).toBe(false);
	// Once the pointer has left the zone, it closes after a short delay.
	await expect(player.locator('.volume')).not.toHaveAttribute('data-open', '', { timeout: 2000 });
});

test('volume: keyboard focus keeps the slider open', async ({ page }) => {
	const player = await playing(page);
	await player.locator('.mute').focus();
	await page.keyboard.press('Tab');
	await expect(player.locator('.volume')).toHaveAttribute('data-open', '');
	await page.keyboard.press('ArrowLeft');
	await page.waitForTimeout(3200);
	await expect(player.locator('.volume')).toHaveAttribute('data-open', '');
	expect(await idle(player)).toBe(false);
});

test('scrubber: keeps scrubbing past the end of the bar, and the controls stay up', async ({ page }) => {
	const player = await playing(page);
	const bar = (await player.locator('.scrubber').boundingBox())!;
	const box = (await player.boundingBox())!;
	await page.mouse.move(bar.x + bar.width * 0.3, bar.y + bar.height / 2);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width + 80, box.y + box.height + 40, { steps: 10 });
	await expect(player.locator('.scrubber')).toHaveAttribute('data-dragging', '');
	await expect(player.locator('.bubble')).toHaveText('0:12');
	await page.waitForTimeout(3200);
	expect(await idle(player)).toBe(false);
	await page.mouse.up();
	await expect.poll(() => player.evaluate((p: any) => p.currentTime)).toBeGreaterThan(10.5);
});

test('settings: a diagonal path from the gear into the quality submenu keeps everything open', async ({ page }) => {
	const player = await playing(page);
	const gear = (await player.locator('.gear').boundingBox())!;
	await page.mouse.move(...(Object.values(center(gear)) as [number, number]));
	await page.mouse.down();
	await page.mouse.up();
	const quality = player.getByRole('menuitem', { name: /Quality/ });
	await expect(quality).toBeVisible();
	await page.waitForTimeout(500); // let the sheet's spring settle before measuring it
	await glide(page, center(gear), center((await quality.boundingBox())!), 25);
	await page.mouse.down();
	await page.mouse.up();
	const option = player.getByRole('menuitemradio', { name: '540p', exact: true });
	await expect(option).toBeVisible();
	await page.waitForTimeout(500);
	await glide(page, center((await quality.boundingBox())!), center((await option.boundingBox())!), 25);
	await page.waitForTimeout(3200);
	await expect(player.locator('.gear')).toHaveAttribute('aria-expanded', 'true');
	expect(await idle(player)).toBe(false);
	await option.click();
	await expect.poll(() => player.evaluate((p: any) => p.engine.getVariantTracks().find((t: any) => t.active).height)).toBe(540);
});

test('controls stay while the pointer rests on them, and hide once it leaves', async ({ page }) => {
	const player = await playing(page);
	await page.mouse.move(...(Object.values(center((await player.locator('.current').boundingBox())!)) as [number, number]));
	await page.waitForTimeout(3500);
	expect(await idle(player)).toBe(false);
	const box = (await player.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + 60);
	await expect.poll(() => idle(player), { timeout: 5000 }).toBe(true);
});

