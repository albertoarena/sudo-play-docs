import { expect, test } from '@playwright/test';
import { builtPages } from './pages';

// The narrowest phone the site supports. Nothing may scroll sideways; code
// that is too wide scrolls inside its own block instead.
test.use({ viewport: { width: 320, height: 640 } });

for (const colorScheme of ['light', 'dark'] as const) {
  for (const path of builtPages()) {
    test(`${path} fits 320px without scrolling sideways, ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test('the panel command wraps only between words at 320px', async ({ page }) => {
  await page.goto('/');
  const words = page.getByTestId('terminal-panel').locator('.word');

  expect(await words.count()).toBeGreaterThan(0);
  for (const word of await words.all()) {
    const lines = await word.evaluate((el) => el.getClientRects().length);
    expect(lines, await word.textContent() ?? '').toBe(1);
  }
});
