import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// Uses the real Seyr video SDK script from a Seyr checkout. Point SEYR_VIDEO_JS elsewhere if needed.
const SDK = process.env.SEYR_VIDEO_JS ?? '/Users/ebnsina/Sites/seyr/tracker/seyr-video.js';
const HOST = 'https://seyr.test';

test.skip(!existsSync(SDK), `the Seyr video SDK isn't at ${SDK}`);

test('with seyr-key, Qyro loads the SDK from seyr-host and reports the view', async ({ page }) => {
	const beacons: Record<string, unknown>[] = [];
	await page.route(`${HOST}/js/seyr-video.js`, (r) => r.fulfill({ contentType: 'text/javascript', body: readFileSync(SDK, 'utf8') }));
	await page.route(`${HOST}/api/video`, async (r) => {
		const body = r.request().postData() ?? '';
		for (const line of body.split('\n').filter(Boolean)) beacons.push(JSON.parse(line));
		await r.fulfill({ status: 202 });
	});
	const q = new URLSearchParams({ src: '/test/fixtures/hls/main.m3u8', muted: '', 'seyr-key': 'demo-key', 'seyr-host': HOST, 'video-id': 'bbb-clip', title: 'Big Buck Bunny', series: 'Open movies' });
	await page.goto(`/test/harness/index.html?${q}`);
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => !!p.engine && p.video.readyState >= 1)).toBe(true);
	await player.locator('.big-play').click();
	await page.waitForTimeout(1500);
	// A new video is a new view.
	await player.evaluate((p: any) => {
		p.setAttribute('video-id', 'bbb-mp4');
		p.src = '/test/fixtures/clip.mp4';
	});
	await page.waitForTimeout(1000);
	await player.evaluate((p: any) => p.remove());
	await expect.poll(() => beacons.length, { timeout: 10000 }).toBeGreaterThan(0);
	const text = JSON.stringify(beacons);
	expect(text).toContain('demo-key');
	expect(text).toContain('bbb-clip');
	expect(text).toContain('bbb-mp4');
	expect(text).toContain('Qyro');
	expect(text).toContain('Big Buck Bunny');
	// The data customers read never names the engine.
	expect(text).toContain('"player_software":"qyro"');
	expect(text).not.toMatch(/shaka/i);
});

test('without seyr-key, nothing is loaded or sent', async ({ page }) => {
	const requests: string[] = [];
	page.on('request', (r) => requests.push(r.url()));
	await page.goto('/test/harness/index.html?src=/test/fixtures/hls/main.m3u8&muted');
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => !!p.engine)).toBe(true);
	await player.locator('.big-play').click();
	await page.waitForTimeout(1000);
	// (The dev server serves Qyro's own small loader module; nothing leaves for a Seyr host.)
	expect(requests.filter((u) => /seyr/i.test(u) && !u.startsWith('http://localhost'))).toEqual([]);
});
