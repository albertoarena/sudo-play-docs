import { expect, test } from '@playwright/test';

// Home's download button is there for a visitor who arrives from a launch
// post, so it must show without scrolling on a small laptop and on a phone.
// Approved 2026-10-20.
const screens = [
  { name: 'a 1280 by 720 laptop', width: 1280, height: 720 },
  { name: 'a 390 by 844 phone', width: 390, height: 844 },
  { name: 'a 320 by 640 phone', width: 320, height: 640 },
];

for (const { name, width, height } of screens) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`the download button shows without scrolling on ${name}, ${colorScheme}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ colorScheme });
      await page.goto('/');

      const button = page.getByRole('link', { name: /^Download for Mac/ });
      const box = await button.boundingBox();

      expect(box).not.toBeNull();
      expect(box!.y + box!.height).toBeLessThanOrEqual(height);
      // A comfortable target, the same height as the consent buttons.
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });
  }
}
