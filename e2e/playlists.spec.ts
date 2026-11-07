import { expect, test } from '@playwright/test';
import { playlists } from '../src/data/catalog';

// The shelf of covers on Playlists, in groups by cover colour. It is the one
// block wider than the reading column. Decided 2026-11-07.
for (const [width, columns] of [
  [320, 2],
  [375, 2],
  [640, 3],
  [900, 4],
  [1280, 6],
] as const) {
  test(`the shelf shows ${columns} covers a row at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/playlists/');
    const lefts = await page
      .locator('.shelf > li')
      .evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().left)));

    expect(lefts).toHaveLength(playlists.length);
    expect(new Set(lefts).size).toBe(columns);
  });
}

test('the shelf is wider than the reading column on a wide screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/playlists/');
  const shelf = await page.locator('.shelf').first().boundingBox();
  const lead = await page.locator('main .lead').boundingBox();

  expect(shelf!.width).toBeGreaterThan(lead!.width);
  expect(Math.abs(shelf!.x + shelf!.width / 2 - 640)).toBeLessThanOrEqual(2);
});

test('each cover is a square', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/playlists/');
  const box = await page.locator('.shelf img').first().boundingBox();

  expect(Math.abs(box!.width - box!.height)).toBeLessThanOrEqual(1);
});

// The cover is part of the link, so a keyboard user sees the ring around it.
test('a focused playlist shows the focus ring', async ({ page }) => {
  await page.goto('/playlists/');
  const link = page.locator('.shelf a').first();
  await link.focus();

  const outline = await link.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).toBe('solid');
});
