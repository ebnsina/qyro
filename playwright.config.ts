import { defineConfig, devices } from '@playwright/test';

const desktop = /^(?!.*touch\.spec).*\.spec\.ts$/;
const touch = /touch\.spec\.ts$/;

export default defineConfig({
	testDir: 'test/e2e',
	fullyParallel: true,
	// Every test plays real video; more workers than this starve each other on one laptop.
	workers: process.env.CI ? undefined : 4,
	reporter: process.env.CI ? 'github' : 'list',
	use: { baseURL: 'http://localhost:5311', trace: 'retain-on-failure' },
	projects: [
		{ name: 'chromium-desktop', testMatch: desktop, use: { ...devices['Desktop Chrome'] } },
		{ name: 'webkit-desktop', testMatch: desktop, use: { ...devices['Desktop Safari'] } },
		{ name: 'chromium-mobile', testMatch: touch, use: { ...devices['Pixel 8'] } },
		{ name: 'webkit-mobile', testMatch: touch, use: { ...devices['iPhone 15'] } },
		{ name: 'webkit-tablet', testMatch: touch, use: { ...devices['iPad (gen 11)'] } },
		{ name: 'chromium-touch-laptop', testMatch: touch, use: { ...devices['Desktop Chrome'], hasTouch: true } },
	],
	webServer: [
		{ command: 'pnpm exec vite --port 5311 --strictPort', url: 'http://localhost:5311/playground/index.html', reuseExistingServer: !process.env.CI },
		// Live streams: a 5-minute DVR window, and a 6-second one that has no DVR (the player treats it as live only).
		{ command: 'bash scripts/live.sh live 150', url: 'http://localhost:5311/test/generated/live/index.m3u8', reuseExistingServer: !process.env.CI },
		{ command: 'bash scripts/live.sh live-no-dvr 3', url: 'http://localhost:5311/test/generated/live-no-dvr/index.m3u8', reuseExistingServer: !process.env.CI },
	],
});
