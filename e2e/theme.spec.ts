import { expect, test, type Page } from '@playwright/test';

// Decided 2026-11-04, as on sudohire.dev: one button at the end of the
// masthead row moves through light, dark and system. Its icon and its name
// say the current mode. Light and dark are stored in the browser; system
// removes the choice and the page follows the Mac again.
const KEY = 'sudoplay-theme';
const LIGHT = 'rgb(255, 255, 255)';
const DARK = 'rgb(9, 9, 11)';

const background = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
const stored = (page: Page) => page.evaluate((key) => localStorage.getItem(key), KEY);
const toggle = (page: Page) => page.getByRole('banner').getByRole('button', { name: /^Theme: / });

test('the toggle moves through light, dark and system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/install/');

  await expect(toggle(page)).toHaveAccessibleName('Theme: system');
  expect(await background(page)).toBe(LIGHT);

  await toggle(page).click();
  await expect(toggle(page)).toHaveAccessibleName('Theme: light');
  expect(await background(page)).toBe(LIGHT);
  expect(await stored(page)).toBe('light');

  await toggle(page).click();
  await expect(toggle(page)).toHaveAccessibleName('Theme: dark');
  expect(await background(page)).toBe(DARK);
  expect(await stored(page)).toBe('dark');

  await page.goto('/tips/');
  await expect(toggle(page)).toHaveAccessibleName('Theme: dark');
  expect(await background(page)).toBe(DARK);

  await toggle(page).click();
  await expect(toggle(page)).toHaveAccessibleName('Theme: system');
  expect(await background(page)).toBe(LIGHT);
  expect(await stored(page)).toBeNull();
});

test('a light choice wins over a dark system, after a reload too', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await background(page)).toBe(DARK);

  await toggle(page).click();
  await page.reload();
  await expect(toggle(page)).toHaveAccessibleName('Theme: light');
  expect(await background(page)).toBe(LIGHT);
});

// The badge and the screenshot pick light or dark with a media query, which
// cannot see a stored choice, so the toggle has to carry them along.
test('the pictures on Home follow the choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  // currentSrc is empty for a moment while a picture chooses again.
  const sources = () =>
    page.locator('.product-hunt img, .window img').evaluateAll((images) =>
      images.map((image) => (image as HTMLImageElement).currentSrc.replace(location.origin, '')),
    );

  await expect.poll(sources).toEqual(['/badges/product-hunt-dark.svg', '/screenshots/window-dark.webp']);
  await toggle(page).click();
  await expect.poll(sources).toEqual(['/badges/product-hunt-light.svg', '/screenshots/window-light.webp']);
  await toggle(page).click();
  await expect.poll(sources).toEqual(['/badges/product-hunt-dark.svg', '/screenshots/window-dark.webp']);
});

test('on a phone the toggle sits on the line of the name', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/install/');
  const mark = await page.getByRole('banner').locator('.brand-mark').boundingBox();
  const button = await toggle(page).boundingBox();

  expect(Math.abs(mark!.y + mark!.height / 2 - (button!.y + button!.height / 2))).toBeLessThanOrEqual(1);
  expect(button!.x + button!.width).toBeLessThanOrEqual(320);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('there is no toggle, and the page follows the system', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/install/');

    await expect(page.getByRole('button', { name: /^Theme: / })).toHaveCount(0);
    expect(await background(page)).toBe(DARK);
  });
});
