import { expect, test, type Locator, type Page } from '@playwright/test';

// The fixture is 12 seconds in three chapters of four: The meadow, Buck wakes up, A butterfly.
const TITLES = ['The meadow', 'Buck wakes up', 'A butterfly'];

async function open(page: Page, params = '&chapters=/test/fixtures/chapters.vtt'): Promise<Locator> {
	await page.goto(`/test/harness/index.html?src=/test/fixtures/hls/main.m3u8&muted${params}`);
	const player = page.locator('qyro-player');
	await player.evaluate((p: any) => {
		p.changes = [];
		p.addEventListener('chapterchange', (e: CustomEvent) => p.changes.push(e.detail.index));
	});
	await expect.poll(() => player.evaluate((p: any) => !!p.engine && p.video.readyState >= 1)).toBe(true);
	return player;
}

async function play(player: Locator): Promise<void> {
	await player.locator('.big-play').click();
	await expect.poll(() => player.evaluate((p: any) => !p.paused)).toBe(true);
}

test('the chapters button shows only when the video has chapters', async ({ page }) => {
	const plain = await open(page, '');
	await play(plain);
	await expect(plain.locator('.toc')).toBeHidden();
	expect(await plain.evaluate((p: any) => p.chapters)).toEqual([]);

	const player = await open(page);
	await play(player);
	await expect(player.locator('.toc')).toBeVisible();
	await expect(player.locator('.toc')).toHaveAttribute('aria-label', 'Chapters');
	await player.evaluate((p: any) => (p.chapters = []));
	await expect(player.locator('.toc')).toBeHidden();
});

test('the panel lists the chapters, opens and closes like Up next, and a click seeks and plays', async ({ page }) => {
	const player = await open(page);
	await play(player);
	await player.evaluate((p: any) => p.pause());
	await player.locator('.toc').click();
	const panel = player.getByRole('dialog', { name: 'Chapters' });
	await expect(panel).toBeVisible();
	await expect(player.locator('.toc')).toHaveAttribute('aria-expanded', 'true');
	await expect(panel.locator('.at')).toHaveText(['0:00', '0:04', '0:08']);
	await expect(panel.locator('.t')).toHaveText(TITLES);
	await expect(panel.locator('[aria-current="true"] .t')).toHaveText('The meadow');
	await expect(panel.locator('[aria-current="true"]')).toBeFocused();
	// Escape closes it and gives focus back to the button.
	await page.keyboard.press('Escape');
	await expect(panel).toBeHidden();
	await expect(player.locator('.toc')).toBeFocused();
	await expect(player.locator('.toc')).toHaveAttribute('aria-expanded', 'false');
	// A press outside closes it and does nothing else.
	await player.locator('.toc').click();
	await expect(panel).toBeVisible();
	const box = (await player.boundingBox())!;
	await page.mouse.click(box.x + 40, box.y + 40);
	await expect(panel).toBeHidden();
	expect(await player.evaluate((p: any) => p.paused)).toBe(true);
	// Arrow keys move between chapters, Enter picks one.
	await player.locator('.toc').click();
	await expect(panel.locator('[aria-current="true"]')).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Enter');
	await expect(panel).toBeHidden();
	await expect.poll(() => player.evaluate((p: any) => p.currentTime)).toBeGreaterThanOrEqual(8);
	await expect.poll(() => player.evaluate((p: any) => p.paused)).toBe(false);
	await expect.poll(() => player.evaluate((p: any) => p.chapter?.title)).toBe('A butterfly');
	// A click on a row seeks there and keeps playing.
	await player.locator('.toc').click();
	await expect(panel.locator('[aria-current="true"] .t')).toHaveText('A butterfly');
	await panel.getByRole('button', { name: /Buck wakes up/ }).click();
	await expect(panel).toBeHidden();
	await expect.poll(() => player.evaluate((p: any) => p.chapter?.title)).toBe('Buck wakes up');
	expect(await player.evaluate((p: any) => p.paused)).toBe(false);
});

test('only one of Chapters, Up next and Settings is open at a time', async ({ page }) => {
	const player = await open(page);
	await play(player);
	await player.locator('.toc').click();
	await expect(player.getByRole('dialog', { name: 'Chapters' })).toBeVisible();
	await player.locator('.gear').click();
	await expect(player.getByRole('dialog', { name: 'Chapters' })).toBeHidden();
	await expect(player.locator('.toc')).toHaveAttribute('aria-expanded', 'false');
	await player.locator('.toc').click();
	await expect(player.locator('.gear')).toHaveAttribute('aria-expanded', 'false');
});

test('chapterchange fires as playback crosses into each chapter', async ({ page }) => {
	const player = await open(page);
	await expect.poll(() => player.evaluate((p: any) => p.chapter?.title)).toBe('The meadow');
	await player.evaluate((p: any) => (p.changes = []));
	const detail = await player.evaluate(
		(p: any) =>
			new Promise((resolve) => {
				p.addEventListener('chapterchange', (e: CustomEvent) => resolve(e.detail), { once: true });
				p.seekToChapter(1);
			}),
	);
	expect(detail).toEqual({ index: 1, chapter: { start: 4, end: 8, title: 'Buck wakes up' } });
	await play(player);
	await expect.poll(() => player.evaluate((p: any) => p.changes), { timeout: 8000 }).toEqual([1, 2]);
});

test('the seek bar has a small gap where each chapter starts and stays thin', async ({ page }) => {
	const player = await open(page);
	await play(player);
	const track = player.locator('.scrubber .track');
	const mask = await track.evaluate((t) => getComputedStyle(t).maskImage || getComputedStyle(t).webkitMaskImage);
	// Two cuts, at a third and two thirds; none at the very start.
	expect(mask).toMatch(/calc\(33\.\d+% - 1px\)/);
	expect(mask).toMatch(/calc\(66\.\d+% \+ 1px\)/);
	expect(mask).not.toMatch(/\(0% - 1px/);
	expect((await track.boundingBox())!.height).toBe(3);
	// Without chapters the bar is whole.
	const plain = await open(page, '');
	await play(plain);
	expect(await plain.locator('.scrubber .track').evaluate((t) => getComputedStyle(t).maskImage)).toMatch(/^(none)?$/);
});

test('the preview shows the chapter title above the time', async ({ page }) => {
	const player = await open(page);
	await play(player);
	const bar = (await player.locator('.scrubber').boundingBox())!;
	for (const [f, title, time] of [
		[0.1, 'The meadow', '0:01'],
		[0.5, 'Buck wakes up', '0:06'],
		[0.9, 'A butterfly', '0:10'],
	] as const) {
		await page.mouse.move(bar.x + bar.width * f, bar.y + bar.height / 2);
		await expect(player.locator('.bubble-chapter')).toHaveText(title);
		await expect(player.locator('.bubble-time')).toHaveText(time);
	}
	const [chapter, time] = await Promise.all(['.bubble-chapter', '.bubble-time'].map(async (s) => (await player.locator(s).boundingBox())!));
	expect(chapter.y + chapter.height).toBeLessThanOrEqual(time.y + 0.5);
	const b = (await player.locator('.bubble').boundingBox())!;
	expect(b.x + b.width).toBeLessThanOrEqual(bar.x + bar.width + 0.5);
	// The seek bar tells screen readers the chapter too.
	await expect(player.locator('.scrubber')).toHaveAttribute('aria-valuetext', /, (The meadow|Buck wakes up|A butterfly)$/);
});

test('the current chapter shows by the time on a wide player and never resizes the bar', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	const player = await open(page);
	await play(player);
	await player.evaluate((p: any) => p.pause());
	const now = player.locator('.chapter-now [data-on]');
	const bar = player.locator('.scrubber');
	const sizes: string[] = [];
	for (const [t, title] of [
		[1, 'The meadow'],
		[5, 'Buck wakes up'],
		[9, 'A butterfly'],
	] as const) {
		await player.evaluate((p: any, at) => p.seek(at), t);
		await expect(now).toHaveText(title);
		await expect(now).toBeVisible();
		const b = (await bar.boundingBox())!;
		sizes.push(`${b.x} ${b.width}`); // the dock may still be settling vertically
	}
	expect(new Set(sizes).size, sizes.join('\n')).toBe(1);
	await page.setViewportSize({ width: 500, height: 800 });
	await expect(player.locator('.chapter-now')).toBeHidden();
});

test('chapters come from a <track kind="chapters"> child, which is not offered as captions', async ({ page }) => {
	const player = await open(page, '&chapter-track=/test/fixtures/chapters.vtt');
	await expect.poll(() => player.evaluate((p: any) => p.chapters.map((c: any) => c.title))).toEqual(TITLES);
	await play(player);
	await expect(player.locator('.toc')).toBeVisible();
	await expect(player.locator('.cc')).toBeHidden();
});

test('player.chapters can be set from script, and bad input fails loudly', async ({ page }) => {
	const player = await open(page, '');
	await play(player);
	await player.evaluate((p: any) => (p.chapters = [{ start: 6, title: 'Second half' }, { start: 0, title: 'First half' }]));
	expect(await player.evaluate((p: any) => p.chapters.map((c: any) => c.title))).toEqual(['First half', 'Second half']);
	await expect(player.locator('.toc')).toBeVisible();
	await player.evaluate((p: any) => p.seekToChapter(1));
	await expect.poll(() => player.evaluate((p: any) => p.chapter?.title)).toBe('Second half');
	const errors = await player.evaluate((p: any) =>
		[() => (p.chapters = [{ title: 'No start' }]), () => (p.chapters = 'nope'), () => p.seekToChapter(5)].map((f) => {
			try {
				f();
				return '';
			} catch (e) {
				return (e as Error).name;
			}
		}),
	);
	expect(errors).toEqual(['TypeError', 'TypeError', 'RangeError']);
	// Back to the file's chapters, if any: this page has none.
	await player.evaluate((p: any) => (p.chapters = null));
	await expect(player.locator('.toc')).toBeHidden();
});

test('a broken chapters file leaves the video playing without chapters, and says why in the console', async ({ page }) => {
	const warnings: string[] = [];
	page.on('console', (m) => m.type() == 'warning' && warnings.push(m.text()));
	const player = await open(page, '&chapters=/test/fixtures/missing.vtt');
	await play(player);
	await expect(player.locator('.toc')).toBeHidden();
	expect(warnings.some((w) => w.includes("couldn't load the chapters"))).toBe(true);
});
