import { expect, test, type Page } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

const player = (page: Page) => page.locator('.pg-player qyro-player');
const ready = (page: Page) => expect.poll(() => player(page).evaluate((p: any) => !!p.engine && p.video.readyState >= 1), { timeout: 30000 }).toBe(true);

test('switching templates keeps the same player and updates the URL', async ({ page }) => {
	await page.goto('/demo');
	await ready(page);
	await player(page).evaluate((p: any) => (p.dataset.mark = 'same'));
	const tabs = page.getByRole('tablist', { name: 'Template' });
	await tabs.getByRole('tab', { name: 'Course' }).click();
	await expect(page).toHaveURL(/\?t=course/);
	expect(await player(page).getAttribute('data-mark')).toBe('same');
	// The course's chapters live inside the player, from its chapters track, not in a list beside it.
	await expect(player(page).locator('track')).toHaveCount(2);
	await expect(player(page).locator('track[kind="chapters"]')).toHaveAttribute('src', /chapters\.vtt$/);
	await expect.poll(() => player(page).evaluate((p: any) => p.chapters?.length), { timeout: 30000 }).toBe(6);
	await expect(page.getByRole('navigation', { name: 'Chapters' })).toHaveCount(0);
	await expect(page.locator('.pg-code .codeblock')).toContainText('<track kind="chapters"');
	// Arrow keys move along the tabs and switch too.
	await page.keyboard.press('ArrowRight');
	await expect(page).toHaveURL(/\?t=article/);
	expect(await player(page).getAttribute('title')).toBe('Sintel');
	// Back returns to the course.
	await page.goBack();
	await expect(page).toHaveURL(/\?t=course/);
	await expect(tabs.getByRole('tab', { name: 'Course' })).toHaveAttribute('aria-selected', 'true');
});

test('source, captions and the code panel stay in step, and the URL round-trips', async ({ page }) => {
	await page.goto('/demo');
	await ready(page);
	await page.getByLabel('Source').selectOption('sintel');
	await expect(player(page)).toHaveAttribute('src', /sintel/);
	await page.getByRole('switch', { name: 'Captions' }).check();
	await expect(player(page).locator('track')).toHaveCount(1);
	await page.getByRole('switch', { name: 'Loop' }).check();
	const code = page.locator('.pg-code .codeblock');
	await expect(code).toContainText('sintel');
	await expect(code).toContainText('<track kind="subtitles"');
	await expect(code).toContainText('loop');
	await page.getByRole('tab', { name: 'React' }).click();
	await expect(code).toContainText('useEffect');
	await page.locator('.pg-code').getByRole('button', { name: 'Copy code' }).click();
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied).toContain("import('@ebnsina/qyro')");
	expect(copied).not.toMatch(/\n\s*$/);
	const url = page.url();
	expect(url).toContain('src=sintel');
	expect(url).toContain('captions=1');
	await page.goto(url);
	await expect(page.getByLabel('Source')).toHaveValue('sintel');
	await expect(page.getByRole('switch', { name: 'Captions' })).toBeChecked();
});

test('the events log shows play and pause', async ({ page }) => {
	await page.goto('/demo?t=standard&src=bbb-mp4');
	await ready(page);
	await player(page).evaluate((p: any) => p.play());
	await expect(page.getByRole('log')).toContainText('play');
	await player(page).evaluate((p: any) => p.pause());
	await expect(page.getByRole('log')).toContainText('pause');
	await page.getByRole('button', { name: 'Clear' }).click();
	await expect(page.getByRole('log')).toContainText('Play the video');
});

test('event times count from the first event and fit their column, even on live', async ({ page }) => {
	await page.goto('/demo?t=live');
	await ready(page);
	await player(page).evaluate((p: any) => p.play());
	await expect(page.getByRole('log')).toContainText('play');
	const times = page.getByRole('log').locator('.at');
	for (const at of await times.all()) {
		await expect(at).toHaveText(/^\d+:\d\d\.\d$/);
		expect(await at.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true);
	}
});

test('the player keeps its size from first paint to playback, at the film\'s own shape', async ({ page }) => {
	await page.goto('/demo?t=standard&src=tos');
	const box = () => player(page).evaluate((p: any) => p.getBoundingClientRect().height);
	const before = await box();
	await ready(page);
	await player(page).evaluate((p: any) => ((p.muted = true), p.play()));
	await page.waitForTimeout(1500);
	expect(Math.abs((await box()) - before)).toBeLessThan(0.5);
	const r = await player(page).evaluate((p: any) => p.getBoundingClientRect().width / p.getBoundingClientRect().height);
	expect(r).toBeCloseTo(2.4, 1);
});

test('old demo pages open the playground on that template', async ({ page }) => {
	await page.goto('/demo/live');
	await expect(page).toHaveURL(/\/demo\?t=live/);
});
