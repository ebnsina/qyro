import { expect, test, type Locator, type Page } from '@playwright/test';

test.skip(({ isMobile }) => isMobile, 'covered on desktop; the menus are the same on touch');

async function open(page: Page, params = ''): Promise<Locator> {
	await page.goto(`/dev/index.html?src=/test/fixtures/hls/main.m3u8&muted&tracks${params}`);
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => !!p.engine && p.engine.getTextTracks().length == 2)).toBe(true);
	return player;
}

const cue = (player: Locator) => player.locator('.shaka-text-container span:not(.shaka-text-wrapper)').first();

test('switches between WebVTT and SRT languages and remembers the choice', async ({ page }) => {
	const player = await open(page);
	await player.locator('.big-play').click();
	await player.locator('.gear').click();
	await player.getByRole('menuitem', { name: /^Captions/ }).click();
	await expect(player.getByRole('menuitemradio')).toHaveText([/Off/, /Auto \(English\)/, /English/, /Español/]);
	await player.getByRole('menuitemradio', { name: 'Español' }).click();
	await expect(cue(player)).toHaveText('Los subtítulos están activados.');
	await expect(player.locator('.cc')).toHaveAttribute('aria-pressed', 'true');
	await page.reload();
	await expect.poll(() => player.evaluate((p: any) => p.engine?.getTextTracks().find((t: any) => t.active)?.language)).toBe('es');
	await page.keyboard.press('Tab');
	await player.focus();
	await page.keyboard.press('c');
	await expect(player.locator('.cc')).toHaveAttribute('aria-pressed', 'false');
});

test('caption style: size, background and color apply to the cues', async ({ page }) => {
	const player = await open(page);
	await player.locator('.big-play').click();
	await page.keyboard.press('c');
	await expect(cue(player)).toBeVisible();
	const before = await cue(player).evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
	// Settings → Captions → Caption style → one of its parts.
	const pick = async (menu: RegExp, option: string) => {
		if (!(await player.locator('.gear').getAttribute('aria-expanded'))?.includes('true')) await player.locator('.gear').click();
		await player.getByRole('menuitem', { name: /^Captions/ }).click();
		await player.getByRole('menuitem', { name: /^Caption style/ }).click();
		await player.getByRole('menuitem', { name: menu }).click();
		await player.getByRole('menuitemradio', { name: option }).click();
		await page.keyboard.press('Escape');
		await page.keyboard.press('Escape');
		await page.keyboard.press('Escape');
	};
	await pick(/^Size/, 'Extra large');
	await pick(/^Background/, 'Solid');
	await pick(/^Text color/, 'Yellow');
	const style = await cue(player).evaluate((e) => {
		const s = getComputedStyle(e);
		return { size: parseFloat(s.fontSize), bg: s.backgroundColor, color: s.color };
	});
	expect(style.size).toBeGreaterThan(before * 1.5);
	expect(style.bg).toBe('rgb(0, 0, 0)');
	expect(style.color).toBe('rgb(255, 225, 77)');
});

test('no caption shows before the first play, even with captions on', async ({ page }) => {
	const player = await open(page);
	await player.evaluate((p: any) => {
		const t = p.engine.getTextTracks()[0];
		p.engine.selectTextTrack(t);
	});
	await page.waitForTimeout(800);
	await expect(player.locator('.shaka-text-container')).toBeHidden();
	await player.locator('.big-play').click();
	await expect(cue(player)).toBeVisible();
});

test('captions lift above the controls while they show', async ({ page }) => {
	const player = await open(page, '&loop');
	await player.locator('.big-play').click();
	await page.keyboard.press('c');
	await expect(cue(player)).toBeVisible();
	const box = (await player.boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.waitForTimeout(500);
	const shown = (await cue(player).boundingBox())!;
	const dock = (await player.locator('.timeline').boundingBox())!;
	expect(shown.y + shown.height).toBeLessThanOrEqual(dock.y);
	await page.mouse.move(box.x + box.width / 2, box.y - 30);
	await expect.poll(async () => (await cue(player).boundingBox())!.y, { timeout: 5000 }).toBeGreaterThan(shown.y + 20);
});

test('storyboard: the preview shows the thumbnail for the time under the pointer', async ({ page }) => {
	await page.goto('/dev/index.html?src=/test/fixtures/hls/main.m3u8&muted&thumbnails=/test/fixtures/storyboard/storyboard.vtt');
	const player = page.locator('qyro-player');
	await expect.poll(() => player.evaluate((p: any) => !!p.engine && p.video.readyState >= 1)).toBe(true);
	await player.locator('.big-play').click();
	await page.waitForTimeout(450); // the controls rise into place as playback starts
	const bar = (await player.locator('.scrubber').boundingBox())!;
	await page.mouse.move(bar.x + bar.width * 0.45, bar.y + bar.height / 2);
	const shot = player.locator('.shot');
	await expect(player.locator('.bubble')).toHaveAttribute('data-shot', '');
	// 45% of 12 s is 5.4 s: the third 2-second tile, at x = 320 in the sprite (drawn at 120+ px wide).
	await expect.poll(() => shot.evaluate((e) => [e.style.backgroundImage.includes('storyboard.jpg'), e.style.backgroundPosition])).toEqual([true, expect.stringMatching(/^-\d+(\.\d+)?px 0px$/)]);
	const [x, w] = await shot.evaluate((e) => [parseFloat(e.style.backgroundPosition), parseFloat(e.style.width)]);
	expect(Math.round((-x / w) * 160)).toBe(320);
	await expect(player.locator('.bubble-time')).toHaveText('0:05');
	await expect(player.locator('.marker')).toHaveCSS('opacity', '1');
});

test('the top level of settings stays short: style lives under Captions', async ({ page }) => {
	const player = await open(page);
	await player.locator('.big-play').click();
	await player.locator('.gear').click();
	await expect(player.locator('.sheet .main').getByRole('menuitem')).toHaveText([/Quality/, /Speed/, /Captions/]);
	await player.getByRole('menuitem', { name: /^Captions/ }).click();
	await expect(player.locator('.sheet .sub').getByRole('menuitem', { name: /Caption style/ })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(player.locator('.sheet .main').getByRole('menuitem', { name: /^Captions/ })).toBeFocused();
});
