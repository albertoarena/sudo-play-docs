import { defineConfig, devices } from '@playwright/test';

export const port = 4321;
// The consent build: the same site with a test measurement ID, in dist-consent/.
const consentPort = 4322;

// Set when a machine already has a Chromium that does not match this
// Playwright version. Otherwise run `npx playwright install chromium`.
const chromium = {
  ...devices['Desktop Chrome'],
  launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
};

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  projects: [
    {
      name: 'chromium',
      testIgnore: /consent\.spec\.ts/,
      use: { ...chromium, baseURL: `http://localhost:${port}` },
    },
    {
      name: 'consent',
      testMatch: /consent\.spec\.ts/,
      use: { ...chromium, baseURL: `http://localhost:${consentPort}` },
    },
  ],
  // `npm run check` builds first: the test list is read from dist/ and
  // dist-consent/, which must exist before Playwright collects tests, and a
  // failed build stops the run.
  // --ignore-lock keeps the server in the foreground. Without it, Astro 7
  // moves preview to the background when an AI agent runs it, the process
  // Playwright started exits at once, and the real server is left orphaned.
  // It also lets the two servers run side by side.
  webServer: [
    {
      command: `npm run preview -- --port ${port} --ignore-lock`,
      url: `http://localhost:${port}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `npm run preview:consent -- --port ${consentPort} --ignore-lock`,
      url: `http://localhost:${consentPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
