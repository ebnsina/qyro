import { defineConfig, devices } from '@playwright/test';

const desktop = /^(?!.*touch\.spec).*\.spec\.ts$/;
const touch = /touch\.spec\.ts$/;

export default defineConfig({
	testDir: 'test/e2e',
	fullyParallel: true,
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
	webServer: { command: 'pnpm exec vite --port 5311 --strictPort', url: 'http://localhost:5311/dev/index.html', reuseExistingServer: !process.env.CI },
});
