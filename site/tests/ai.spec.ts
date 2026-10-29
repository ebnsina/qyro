import { expect, test } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('Use with AI: picking a tool shows its install step and keeps it in the URL', async ({ page }) => {
	await page.goto('/docs/ai');
	const tools = page.getByRole('radiogroup', { name: 'Your AI tool' });
	await expect(tools.getByRole('radio')).toHaveText(['Claude Code', 'Codex', 'Cursor', 'GitHub Copilot', 'Gemini CLI', 'Windsurf', 'Any other AI']);
	await tools.getByRole('radio', { name: 'Codex' }).click();
	await expect(page.getByRole('heading', { name: 'Install the skill in Codex' })).toBeVisible();
	await expect(page.locator('.ai-install')).toContainText('.agents/skills/qyro/');
	await expect(page).toHaveURL(/tool=codex/);
	// Arrow keys move between tools.
	await page.keyboard.press('ArrowRight');
	await expect(page.locator('.ai-install')).toContainText('.cursor/skills/qyro/');
	// Remembered on the next visit.
	await page.goto('/docs/ai');
	await expect(tools.getByRole('radio', { name: 'Cursor' })).toHaveAttribute('aria-checked', 'true');
});

test('Copy full prompt copies the whole prompt, exactly', async ({ page }) => {
	await page.goto('/docs/ai');
	const item = page.locator('.ai-prompts > li').filter({ hasText: 'Add captions and thumbnails' });
	const full = await item.locator('pre').textContent();
	expect(full).toContain('llms-full.txt');
	expect(full).toContain('When you are done, check:');
	await item.getByRole('button', { name: 'Copy full prompt' }).click();
	await expect(item.getByRole('button', { name: /Copied/ })).toBeVisible();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(full);
	await item.getByRole('button', { name: 'Show full prompt' }).click();
	await expect(item.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
});

test('the Markdown copy and llms-full.txt carry the same prompts', async ({ request }) => {
	const md = await (await request.get('/docs/ai.md')).text();
	const full = await (await request.get('/llms-full.txt')).text();
	for (const text of [md, full]) {
		expect(text).toContain('### Gemini CLI');
		expect(text).toContain('.gemini/skills');
		expect(text).toContain('### Move from Video.js, Plyr or YouTube');
		expect(text).not.toContain('<!-- ai:');
	}
});
