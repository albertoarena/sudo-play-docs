import { expect, test } from '@playwright/test';

// Home shows the app window in the visitor's colour scheme, and the browser
// loads the 2x capture, so it is sharp on a Retina screen.
for (const colorScheme of ['light', 'dark'] as const) {
  test(`Home shows the ${colorScheme} window`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    const window = page.getByRole('img', { name: /^The Sudo Play window\./ });

    await expect(window).toBeVisible();
    await expect.poll(() => window.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(
      new RegExp(`/screenshots/window-${colorScheme}\\.webp$`),
    );
    expect(await window.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(720);
  });
}

// How it works shows the Settings window, from its 2x capture.
test('How it works shows the Settings window', async ({ page }) => {
  await page.goto('/how-it-works/');
  const settings = page.getByRole('img', { name: /^The Sudo Play Settings window,/ });

  await expect(settings).toBeVisible();
  expect(await settings.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(880);
});
