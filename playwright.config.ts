import { defineConfig, devices } from '@playwright/test';

const port = 4321;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Set when a machine already has a Chromium that does not match this
        // Playwright version. Otherwise run `npx playwright install chromium`.
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : {},
      },
    },
  ],
  // `npm run check` builds first: the test list is read from dist/, which
  // must exist before Playwright collects tests, and a failed build stops
  // the run.
  // --ignore-lock keeps the server in the foreground. Without it, Astro 7
  // moves preview to the background when an AI agent runs it, the process
  // Playwright started exits at once, and the real server is left orphaned.
  webServer: {
    command: `npm run preview -- --port ${port} --ignore-lock`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
