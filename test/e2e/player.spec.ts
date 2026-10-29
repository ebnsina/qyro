import { expect, test, type Page } from '@playwright/test';

const HLS = '/test/fixtures/hls/main.m3u8';

async function open(page: Page, params: Record<string, string> = {}) {
	const q = new URLSearchParams({ src: HLS, title: 'Test pattern', muted: '', ...params });
	await page.goto(`/dev/index.html?${q}`);
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => !!p.engine && p.video.readyState >= 1)).toBe(true);
	return player;
}

const state = (player: ReturnType<Page['locator']>) =>
	player.evaluate((p: any) => ({ paused: p.paused, time: p.currentTime, duration: p.duration }));

async function play(player: ReturnType<Page['locator']>) {
	await player.locator('.big-play').click();
	await expect.poll(async () => (await state(player)).time).toBeGreaterThan(0.3);
}

test('loads, plays and re-dispatches media events on the element', async ({ page }) => {
	const player = await open(page);
	await player.evaluate((p: any) => {
		p.events = [];
		for (const e of ['play', 'playing', 'timeupdate']) p.addEventListener(e, () => p.events.includes(e) || p.events.push(e));
	});
	await expect(player.locator('.big-play')).toHaveAttribute('aria-label', 'Play');
	await play(player);
	expect((await state(player)).paused).toBe(false);
	expect(await player.evaluate((p: any) => p.events.sort())).toEqual(['play', 'playing', 'timeupdate']);
	await expect(player.locator('.play')).toHaveAttribute('aria-label', 'Pause');
});

test('pauses from the control bar', async ({ page }) => {
	const player = await open(page);
	await play(player);
	await player.locator('.play').click();
	await expect.poll(async () => (await state(player)).paused).toBe(true);
	await expect(player.locator('.big-play')).toBeVisible();
});

test('seeks by clicking the scrubber', async ({ page }) => {
	const player = await open(page);
	await play(player);
	const bar = player.locator('.scrubber');
	const box = (await bar.boundingBox())!;
	await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
	await expect(player.locator('.bubble')).toHaveText(/0:0[56]/);
	await page.mouse.down();
	await page.mouse.up();
	await expect.poll(async () => (await state(player)).time).toBeGreaterThan(5.5);
	expect((await state(player)).time).toBeLessThan(8);
	await expect(bar).toHaveAttribute('aria-valuemax', '12');
});

test('keyboard: space, j/l, arrows and number keys', async ({ page }) => {
	const player = await open(page);
	await player.focus();
	await page.keyboard.press(' ');
	await expect.poll(async () => (await state(player)).paused).toBe(false);
	await page.keyboard.press('k');
	await expect.poll(async () => (await state(player)).paused).toBe(true);
	await page.keyboard.press('5');
	await expect.poll(async () => (await state(player)).time).toBeCloseTo(6, 0);
	await page.keyboard.press('ArrowLeft');
	await expect.poll(async () => (await state(player)).time).toBeCloseTo(1, 0);
	await page.keyboard.press('l');
	await expect.poll(async () => (await state(player)).time).toBeCloseTo(11, 0);
	await page.keyboard.press('j');
	await expect.poll(async () => (await state(player)).time).toBeCloseTo(1, 0);
	await page.keyboard.press('m');
	await expect.poll(() => player.evaluate((p: any) => p.muted)).toBe(false);
	await expect(player.locator('.sr')).toHaveText('Sound on');
});

test('settings: switches quality, then back to Auto', async ({ page }) => {
	const player = await open(page);
	await play(player);
	await player.locator('.gear').click();
	const sheet = player.locator('.sheet');
	await expect(player.locator('.gear')).toHaveAttribute('aria-expanded', 'true');
	await sheet.getByRole('menuitem', { name: /Quality/ }).click();
	await expect(sheet.getByRole('menuitemradio')).toHaveText(['Auto', '720pHD', '540p', '360p'].map((s) => new RegExp(s.replace('HD', '.*HD'))));
	await sheet.getByRole('menuitemradio', { name: '360p', exact: true }).click();
	await expect
		.poll(() => player.evaluate((p: any) => [p.engine.getConfiguration().abr.enabled, p.engine.getVariantTracks().find((t: any) => t.active).height]))
		.toEqual([false, 360]);
	await expect(sheet.getByRole('menuitem', { name: /Quality/ })).toContainText('360p');
	await sheet.getByRole('menuitem', { name: /Quality/ }).click();
	await sheet.getByRole('menuitemradio', { name: /Auto/ }).click();
	await expect.poll(() => player.evaluate((p: any) => p.engine.getConfiguration().abr.enabled)).toBe(true);
	await page.keyboard.press('Escape');
	await expect(player.locator('.gear')).toHaveAttribute('aria-expanded', 'false');
});

test('settings: speed and captions', async ({ page }) => {
	const player = await open(page, { captions: '/test/fixtures/captions.vtt' });
	await expect(player.locator('.cc')).toBeVisible();
	await play(player);
	await page.keyboard.press('c');
	await expect(player.locator('.cc')).toHaveAttribute('aria-pressed', 'true');
	await expect(player.locator('.shaka-text-container')).toContainText('Captions are on.');
	await player.locator('.gear').click();
	await player.getByRole('menuitem', { name: /Speed/ }).click();
	await player.getByRole('menuitemradio', { name: '1.5×' }).click();
	await expect.poll(() => player.evaluate((p: any) => p.video.playbackRate)).toBe(1.5);
	await player.getByRole('menuitem', { name: /Captions/ }).click();
	await player.getByRole('menuitemradio', { name: 'Off' }).click();
	await expect(player.locator('.cc')).toHaveAttribute('aria-pressed', 'false');
});

test('toggles full screen', async ({ page }) => {
	const player = await open(page);
	await play(player);
	await player.locator('.fs').click();
	await expect.poll(() => page.evaluate(() => document.fullscreenElement?.tagName)).toBe('QYRO-PLAYER');
	await expect(player.locator('.fs')).toHaveAttribute('aria-label', 'Exit full screen');
	await player.locator('.fs').click();
	await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
});

test('shows a plain error with a working retry for a bad URL', async ({ page }) => {
	const logs: string[] = [];
	page.on('console', (m) => m.type() != 'debug' && logs.push(m.text()));
	await page.goto('/dev/index.html?src=/test/fixtures/missing.m3u8');
	const player = page.locator('qyro-player');
	const error = player.locator('.error');
	await expect(error).toBeVisible();
	await expect(error.locator('.error-title')).toHaveText("This video can't play right now");
	await expect(error).not.toContainText(/\d{4}|shaka|error/i);
	expect(await player.evaluate((p: any) => [p.error.kind, p.error.code])).toEqual(['not-found', 1001]);
	await player.evaluate((p: any) => (p.src = '/test/fixtures/hls/main.m3u8'));
	await expect.poll(() => player.evaluate((p: any) => p.error)).toBeNull();
	await play(player);
	// Nothing about the engine reaches the console, only the browser's own 404 line.
	expect(logs.filter((l) => !/Failed to load resource/.test(l))).toEqual([]);
});

test('plays progressive MP4', async ({ page }) => {
	const player = await open(page, { src: '/test/fixtures/clip.mp4' });
	await play(player);
	expect((await state(player)).duration).toBeCloseTo(6, 0);
});


test('shows replay at the end, and replay starts over', async ({ page }) => {
	const player = await open(page, { src: '/test/fixtures/clip.mp4' });
	await play(player);
	await player.evaluate((p: any) => p.seek(p.duration - 0.3));
	await expect(player.locator('.big-play')).toHaveAttribute('aria-label', 'Replay', { timeout: 5000 });
	await expect(player.locator('.big-play .i-replay')).toHaveCSS('opacity', '1');
	await player.locator('.big-play').click();
	await expect.poll(async () => (await state(player)).paused).toBe(false);
	expect((await state(player)).time).toBeLessThan(3);
	await expect(player.locator('.big-play')).toHaveAttribute('aria-label', /Play|Pause/);
});

test('the preview bubble shows the time under the pointer and stays inside the bar', async ({ page }) => {
	const player = await open(page);
	await play(player);
	const bar = (await player.locator('.scrubber').boundingBox())!;
	const bubble = player.locator('.bubble');
	for (const f of [0.02, 0.26, 0.5, 0.74, 0.99]) {
		await page.mouse.move(bar.x + bar.width * f, bar.y + bar.height / 2);
		await expect(bubble).toHaveText(`0:${String(Math.floor(f * 12)).padStart(2, '0')}`);
		await page.waitForTimeout(350);
		const b = (await bubble.boundingBox())!;
		expect(b.x).toBeGreaterThanOrEqual(bar.x - 0.5);
		expect(b.x + b.width).toBeLessThanOrEqual(bar.x + bar.width + 0.5);
	}
});

test('settings only lists rows with a real choice', async ({ page }) => {
	const player = await open(page);
	await play(player);
	await player.locator('.gear').click();
	// The fixture has one audio language and no captions.
	await expect(player.locator('.sheet .main').getByRole('menuitem')).toHaveText([/Quality/, /Speed/]);
});

for (const width of [1280, 375]) {
	test(`timeline: times sit on the scrubber's line and never resize it (${width}px)`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 });
		const player = await open(page);
		await play(player);
		await player.evaluate((p: any) => p.pause());
		const parts = ['.current', '.scrubber', '.duration'].map((s) => player.locator(s));
		const boxes = async () => Promise.all(parts.map(async (l) => (await l.boundingBox())!));
		const [left, bar, right] = await boxes();
		const mid = (b: { y: number; height: number }) => b.y + b.height / 2;
		expect(Math.abs(mid(left) - mid(bar))).toBeLessThanOrEqual(1);
		expect(Math.abs(mid(right) - mid(bar))).toBeLessThanOrEqual(1);
		expect(left.x + left.width).toBeLessThanOrEqual(bar.x);
		expect(bar.x + bar.width).toBeLessThanOrEqual(right.x);
		// Same bar box at the start, mid-video and after switching to time remaining.
		const sizes: string[] = [];
		for (const step of [() => player.evaluate((p: any) => p.seek(0)), () => player.evaluate((p: any) => p.seek(6)), () => player.locator('.duration').click()]) {
			await step();
			await page.waitForTimeout(300);
			sizes.push(JSON.stringify((await boxes())[1]));
		}
		expect(new Set(sizes).size).toBe(1);
		await expect(player.locator('.duration')).toHaveText(/^-0:0\d$/);
	});
}

for (const dpr of [1, 2, 3]) {
	test.describe(`at ${dpr}x`, () => {
		test.use({ deviceScaleFactor: dpr });

		test('the picture fills the player with no edge bars at a fractional width, and the seek bead shows at rest', async ({ page }) => {
			const player = await open(page);
			await player.evaluate((p: any) => (p.style.width = '1137.5px'));
			await play(player);
			await expect(player.locator('video')).toHaveAttribute('data-fill', '');
			const [host, video] = await player.evaluate((p: any) => [p.getBoundingClientRect().toJSON(), p.video.getBoundingClientRect().toJSON()]);
			for (const k of ['left', 'right', 'top', 'bottom']) expect(Math.abs(host[k] - video[k])).toBeLessThan(0.5);
			const [w, h] = (await player.evaluate((p: any) => getComputedStyle(p).aspectRatio)).split('/').map(Number);
			expect(w / h).toBeCloseTo(16 / 9, 2);
			await page.mouse.move(0, 0);
			await expect(player.locator('.scrubber .thumb')).toHaveCSS('transform', /none|matrix\(1, 0, 0, 1, 0, 0\)/);
			await expect(player.locator('.volume-slider .thumb')).toHaveCSS('transform', /none|matrix\(1, 0, 0, 1, 0, 0\)/);
		});
	});
}
test('qualitychange fires with the new resolution when the viewer picks one', async ({ page }) => {
	const player = await open(page);
	await player.evaluate((p: any) => {
		p.changes = [];
		p.addEventListener('qualitychange', (e: CustomEvent) => p.changes.push(e.detail));
	});
	await play(player);
	await player.locator('.gear').click();
	await player.getByRole('menuitem', { name: /Quality/ }).click();
	await player.getByRole('menuitemradio', { name: '360p', exact: true }).click();
	await expect.poll(() => player.evaluate((p: any) => p.changes.at(-1))).toMatchObject({ height: 360, auto: false });
});
