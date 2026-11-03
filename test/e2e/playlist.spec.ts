import { expect, test, type Locator, type Page } from '@playwright/test';

const items = [
	{ src: '/test/fixtures/hls/main.m3u8', title: 'Meadow', duration: 12, poster: '/test/fixtures/storyboard/storyboard.jpg', videoId: 'meadow' },
	{ src: '/test/fixtures/clip.mp4', title: 'Clip', duration: 6, videoId: 'clip' },
	{ src: '/test/fixtures/hls/main.m3u8', title: 'Meadow again', duration: 12 },
];

async function open(page: Page, attrs = ''): Promise<Locator> {
	await page.goto(`/playground/index.html?src=&muted${attrs}`);
	const player = page.locator('qyro-player');
	await player.evaluate((p: any, list) => {
		p.events = [];
		p.addEventListener('itemchange', (e: CustomEvent) => p.events.push(e.detail.index));
		p.playlist = list;
	}, items);
	await expect.poll(() => player.evaluate((p: any) => !!p.engine && p.video.readyState >= 1)).toBe(true);
	return player;
}

const at = (player: Locator) => player.evaluate((p: any) => ({ index: p.index, src: p.src, title: p.getAttribute('title'), paused: p.paused }));

test('next and previous move through the playlist', async ({ page }) => {
	const player = await open(page);
	expect(await at(player)).toMatchObject({ index: 0, title: 'Meadow' });
	await expect(player.locator('.next')).toBeVisible();
	await player.locator('.big-play').click();
	await player.locator('.next').click();
	await expect.poll(async () => (await at(player)).title).toBe('Clip');
	await expect.poll(async () => (await at(player)).paused).toBe(false);
	await player.locator('.prev').click();
	await expect.poll(async () => (await at(player)).index).toBe(0);
	expect(await player.evaluate((p: any) => p.events)).toEqual([0, 1, 0]);
});

test('near the end an Up next card counts down, then the next video plays', async ({ page }) => {
	const player = await open(page);
	await player.locator('.big-play').click();
	await player.evaluate((p: any) => p.seek(p.duration - 4));
	await expect(player.locator('.next-card')).toBeVisible();
	await expect(player.locator('.next-title')).toHaveText('Clip');
	await expect(player.locator('.next-count')).toHaveText(/in [1-4]/);
	await expect.poll(async () => (await at(player)).title, { timeout: 10000 }).toBe('Clip');
	await expect.poll(async () => (await at(player)).paused).toBe(false);
});

test('Cancel keeps the viewer on this video', async ({ page }) => {
	const player = await open(page);
	await player.locator('.big-play').click();
	await player.evaluate((p: any) => p.seek(p.duration - 3));
	await player.locator('.next-cancel').click();
	await expect(player.locator('.next-card')).toBeHidden();
	await expect.poll(() => player.evaluate((p: any) => p.ended), { timeout: 10000 }).toBe(true);
	expect((await at(player)).index).toBe(0);
});

test('the Up next panel lists the videos and plays the one picked', async ({ page }) => {
	const player = await open(page);
	await player.locator('.big-play').click();
	await player.locator('.list').click();
	const panel = player.getByRole('dialog', { name: 'Up next' });
	await expect(panel).toBeVisible();
	await expect(panel.locator('.t')).toHaveText(['Meadow', 'Clip', 'Meadow again']);
	await expect(panel.locator('[aria-current="true"] .t')).toHaveText('Meadow');
	await expect(panel.locator('[aria-current="true"]')).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect.poll(async () => (await at(player)).index).toBe(2);
	await player.locator('.list').click();
	await expect(panel.locator('[aria-current="true"]')).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(panel).toBeHidden();
	await expect(player.locator('.list')).toBeFocused();
});

test('autoadvance="false" stops at the end of each video', async ({ page }) => {
	const player = await open(page, '&autoadvance=false');
	await player.locator('.big-play').click();
	await player.evaluate((p: any) => p.seek(p.duration - 2));
	await expect.poll(() => player.evaluate((p: any) => p.ended), { timeout: 10000 }).toBe(true);
	await expect(player.locator('.next-card')).toBeHidden();
	expect((await at(player)).index).toBe(0);
});
