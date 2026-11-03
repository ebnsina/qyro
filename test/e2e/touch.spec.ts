import { expect, test, type Locator, type Page } from '@playwright/test';

// Runs on the phone and tablet projects (and with emulated touch on desktop).

async function open(page: Page, params = ''): Promise<Locator> {
	await page.goto(`/test/harness/index.html?src=/test/fixtures/hls/main.m3u8&title=Big%20Buck%20Bunny&muted${params}`);
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => !!p.engine && p.video.readyState >= 1)).toBe(true);
	return player;
}

const state = (player: Locator) => player.evaluate((p: any) => ({ paused: p.paused, time: p.currentTime }));
const idle = (player: Locator) => player.evaluate((p: any) => p.shadowRoot.querySelector('.root').hasAttribute('data-idle'));

async function playing(page: Page, params = ''): Promise<Locator> {
	const player = await open(page, params);
	await player.locator('.big-play').tap();
	await expect.poll(async () => (await state(player)).paused).toBe(false);
	return player;
}

/** Playwright can't hold or drag a finger, so these send the pointer events a finger produces. */
function finger(player: Locator, selector: string) {
	return (type: string, x: number, y: number) =>
		player.evaluate(
			(p: any, [sel, type, x, y]) =>
				p.shadowRoot.querySelector(sel).dispatchEvent(new PointerEvent(type as string, { pointerType: 'touch', pointerId: 7, clientX: x as number, clientY: y as number, button: 0, bubbles: true, composed: true, isPrimary: true })),
			[selector, type, x, y] as const,
		);
}

test.use({ hasTouch: true });

test('fits, keeps 44px targets and hides the volume slider', async ({ page }) => {
	const player = await open(page);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	await player.locator('.big-play').tap();
	await expect.poll(async () => (await state(player)).paused).toBe(false);
	const box = (await player.boundingBox())!;
	for (const b of ['.play', '.gear', '.fs']) {
		const r = (await player.locator(b).boundingBox())!;
		expect(r.height).toBeGreaterThanOrEqual(44);
		expect(r.x).toBeGreaterThanOrEqual(box.x);
		expect(r.x + r.width).toBeLessThanOrEqual(box.x + box.width + 0.5);
	}
	await expect(player.locator('.volume')).toBeHidden();
});

test('a tap shows or hides the controls and never toggles play', async ({ page }) => {
	const player = await playing(page);
	await expect.poll(() => idle(player), { timeout: 6000 }).toBe(true);
	const s = (await player.locator('.surface').boundingBox())!;
	await page.touchscreen.tap(s.x + s.width / 2, s.y + 20);
	await expect.poll(() => idle(player)).toBe(false);
	await page.touchscreen.tap(s.x + s.width / 2, s.y + 20);
	await expect.poll(() => idle(player)).toBe(true);
	expect((await state(player)).paused).toBe(false);
});

// Two taps in one task: real taps arrive too far apart under load to count as a double tap (280ms window).
async function doubleTap(player: Locator, x: number, y: number) {
	await player.locator('.surface').evaluate((el, [px, py]) => {
		for (let i = 0; i < 2; i++) {
			const init = { bubbles: true, composed: true, pointerType: 'touch', pointerId: 1, isPrimary: true, clientX: px, clientY: py };
			el.dispatchEvent(new PointerEvent('pointerdown', init));
			el.dispatchEvent(new PointerEvent('pointerup', init));
		}
	}, [x, y]);
}

test('double tap on the right seeks forward with a ripple, on the left seeks back', async ({ page }) => {
	// Loop: the 12s clip could reach its end under load, which pauses it.
	const player = await playing(page, '&loop');
	await player.evaluate((p: any) => p.seek(1));
	const s = (await player.locator('.surface').boundingBox())!;
	const before = (await state(player)).time;
	await doubleTap(player, s.x + s.width * 0.85, s.y + s.height / 2);
	await expect.poll(async () => (await state(player)).time).toBeGreaterThan(before + 8);
	await expect(player.locator('.ripple[data-side="forward"]')).toHaveAttribute('data-on', '');
	await page.waitForTimeout(500);
	await doubleTap(player, s.x + s.width * 0.15, s.y + s.height / 2);
	await expect.poll(async () => (await state(player)).time).toBeLessThan(5);
	expect((await state(player)).paused).toBe(false);
});

test('dragging the scrubber shows the dot and preview under the finger and seeks on release', async ({ page }) => {
	const player = await playing(page);
	const bar = (await player.locator('.scrubber').boundingBox())!;
	const move = finger(player, '.scrubber');
	const y = bar.y + bar.height / 2;
	await move('pointerdown', bar.x + bar.width * 0.2, y);
	await move('pointermove', bar.x + bar.width * 0.7, y);
	await expect(player.locator('.marker')).toHaveCSS('opacity', '1');
	await expect(player.locator('.bubble-time')).toHaveText('0:08');
	const bubble = (await player.locator('.bubble').boundingBox())!;
	expect(bubble.y + bubble.height).toBeLessThan(bar.y - 20); // above the finger
	await move('pointerup', bar.x + bar.width * 0.7, y);
	await expect.poll(async () => (await state(player)).time).toBeGreaterThan(7.5);
});

test('settings work with taps', async ({ page }) => {
	const player = await playing(page);
	await player.locator('.gear').tap();
	await player.getByRole('menuitem', { name: /Quality/ }).tap();
	await player.getByRole('menuitemradio', { name: '360p', exact: true }).tap();
	await expect.poll(() => player.evaluate((p: any) => p.engine.getVariantTracks().find((t: any) => t.active).height)).toBe(360);
	const sheet = (await player.locator('.sheet').boundingBox())!;
	const box = (await player.boundingBox())!;
	expect(sheet.x).toBeGreaterThanOrEqual(box.x);
	expect(sheet.x + sheet.width).toBeLessThanOrEqual(box.x + box.width + 0.5);
});

test('a long press opens the menu, and lifting does not count as a tap', async ({ page }) => {
	const player = await open(page);
	const s = (await player.locator('.surface').boundingBox())!;
	const press = finger(player, '.surface');
	await press('pointerdown', s.x + s.width / 2, s.y + s.height / 3);
	await page.waitForTimeout(800);
	const open_ = () => player.evaluate((p: any) => p.shadowRoot.querySelector('.root').hasAttribute('data-menu'));
	await expect.poll(open_).toBe(true);
	await press('pointerup', s.x + s.width / 2, s.y + s.height / 3);
	await page.waitForTimeout(400);
	expect(await open_()).toBe(true);
	expect((await state(player)).paused).toBe(true);
	const menu = (await player.locator('.menu').boundingBox())!;
	const box = (await player.boundingBox())!;
	expect(menu.x + menu.width).toBeLessThanOrEqual(box.x + box.width);
	expect(menu.y + menu.height).toBeLessThanOrEqual(box.y + box.height);
});

test('page scroll still works over the video', async ({ page }) => {
	await open(page);
	const touchAction = await page.locator('qyro-player').evaluate((p: any) => getComputedStyle(p.shadowRoot.querySelector('.surface')).touchAction);
	expect(touchAction).toBe('auto');
});

for (const width of [300, 320, 360, 414]) {
	test(`small player ${width}px wide: nothing overlaps`, async ({ page }) => {
		await page.setViewportSize({ width: Math.max(width, 320), height: 700 });
		const player = await open(page);
		await player.evaluate((p: any, w: number) => (p.style.width = `${w}px`), width);
		await player.locator('.big-play').tap();
		await expect.poll(async () => (await state(player)).paused).toBe(false);
		const boxes = await player.evaluate((p: any) =>
			[...p.shadowRoot.querySelectorAll('.row > .cap, .row .btn, .timeline > *')]
				.filter((e: Element) => getComputedStyle(e).display != 'none' && (e as HTMLElement).offsetWidth)
				.map((e: Element) => {
					const r = e.getBoundingClientRect();
					return { c: e.className, l: r.left, r: r.right, t: r.top, b: r.bottom };
				}),
		);
		const host = (await player.boundingBox())!;
		for (const b of boxes) expect(b.r, b.c).toBeLessThanOrEqual(host.x + host.width + 0.5);
		const caps = boxes.filter((b) => b.c.includes('cap'));
		for (let i = 1; i < caps.length; i++) expect(caps[i].l, `${caps[i].c} overlaps`).toBeGreaterThanOrEqual(caps[i - 1].r);
	});
}

test('chapters open with a tap, as a bottom sheet on phones, and a tap on one seeks there', async ({ page }) => {
	const player = await playing(page, '&loop&chapters=/test/fixtures/chapters.vtt');
	await player.locator('.toc').tap();
	const panel = player.getByRole('dialog', { name: 'Chapters' });
	await expect(panel).toBeVisible();
	const box = (await player.boundingBox())!;
	// The button is still settling right after the tap, so wait for its final size.
	await expect.poll(async () => (await player.locator('.toc').boundingBox())!.height).toBeGreaterThanOrEqual(44);
	await page.waitForTimeout(500); // the panel slides into place
	const sheet = (await panel.boundingBox())!;
	expect(sheet.x).toBeGreaterThanOrEqual(box.x);
	expect(sheet.x + sheet.width).toBeLessThanOrEqual(box.x + box.width + 0.5);
	if (box.width <= 440) {
		// Edge to edge along the bottom, over the controls.
		expect(sheet.width).toBeGreaterThan(box.width - 30);
		expect(box.y + box.height - (sheet.y + sheet.height)).toBeLessThan(16);
	}
	await panel.getByRole('button', { name: /A butterfly/ }).tap();
	await expect(panel).toBeHidden();
	await expect.poll(async () => (await state(player)).time).toBeGreaterThanOrEqual(8);
	expect((await state(player)).paused).toBe(false);
	// A tap outside closes it without pausing.
	await player.locator('.toc').tap();
	await expect(panel).toBeVisible();
	await page.touchscreen.tap(box.x + 30, box.y + 30);
	await expect(panel).toBeHidden();
	expect((await state(player)).paused).toBe(false);
});
