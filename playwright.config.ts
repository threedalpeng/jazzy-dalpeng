import { defineConfig } from '@playwright/test';
export default defineConfig({
	testDir: './e2e',
	use: { baseURL: 'http://127.0.0.1:1357', headless: true },
	webServer: {
		command: 'npm run dev -- --host 127.0.0.1',
		url: 'http://127.0.0.1:1357/jazzy-dalpeng/',
		reuseExistingServer: !process.env.CI
	}
});
