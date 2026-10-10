// @ts-check
import { defineConfig } from 'vitest/config';

// Checks on the built site in dist/. Playwright specs live in e2e/.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
