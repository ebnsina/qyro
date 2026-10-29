import { defineConfig, devices } from '@playwright/test';

// The website, built and served as it ships.
export default defineConfig({
	testDir: 'tests',
	reporter: process.env.CI ? 'github' : 'list',
	use: { baseURL: 'http://localhost:5321' },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: { command: 'pnpm exec vite preview --port 5321 --strictPort', url: 'http://localhost:5321/', reuseExistingServer: !process.env.CI },
});
