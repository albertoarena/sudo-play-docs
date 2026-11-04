import { expect, test } from '@playwright/test';
import { builtPages } from './pages';

// The shell: every page carries the same masthead, main column and footer.
for (const path of builtPages()) {
  test.describe(path, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('has the masthead with the site navigation', async ({ page }) => {
      const banner = page.getByRole('banner');

      await expect(banner).toHaveCount(1);
      await expect(banner.getByRole('link', { name: 'Sudo Play' })).toHaveAttribute('href', '/');
      await expect(banner.getByRole('navigation', { name: 'Site' })).toHaveCount(1);
    });

    // DIRECTION.md: the band stays about 56px on inner pages, so it reads
    // as chrome. Only Home grows it into the terminal panel.
    if (path !== '/') {
      test('keeps the masthead band short', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        const box = await page.getByRole('banner').boundingBox();

        expect(box!.height).toBeLessThanOrEqual(64);
      });
    }

    test('has one main and one footer', async ({ page }) => {
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('contentinfo')).toHaveCount(1);
    });

    test('has exactly one h1, inside main', async ({ page }) => {
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.getByRole('main').locator('h1')).toHaveCount(1);
    });

    test('has a favicon on its own origin', async ({ page, baseURL }) => {
      const href = await page.locator('link[rel="icon"]').first().getAttribute('href');

      expect(href).not.toBeNull();
      expect(new URL(href!, baseURL).origin).toBe(new URL(baseURL!).origin);
    });
  });
}

// Decided in review of PR #2: on a wide screen the reading column sits in
// the middle of the page, and previous and next sit under it.
test('centres the reading column on a wide screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/how-it-works/');
  const middle = 1440 / 2;

  for (const box of [
    await page.locator('main .column').boundingBox(),
    await page.getByRole('navigation', { name: 'Previous and next' }).boundingBox(),
  ]) {
    expect(Math.abs(box!.x + box!.width / 2 - middle)).toBeLessThanOrEqual(2);
  }
});

// Decided 2026-11-04: on a wide screen the masthead row stays at the top
// while the page scrolls, Home included, where the panel scrolls away under
// it. Below 40rem the masthead stacks to about 120px, so it scrolls away
// as before and the phone keeps its reading space.
for (const path of builtPages()) {
  test(`${path} keeps the masthead row at the top on a wide screen`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto(path);
    // The 404 is shorter than the window, so give every page room to scroll.
    await page.locator('main').evaluate((main) => (main.style.paddingBottom = '100vh'));
    await page.mouse.wheel(0, 2000);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    const box = await page.getByRole('banner').boundingBox();
    expect(box!.y).toBe(0);
    expect(box!.height).toBeLessThanOrEqual(64);
  });
}

test('the masthead scrolls away on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/install/');
  await page.mouse.wheel(0, 1000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

  const box = await page.getByRole('banner').boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(0);
});

test('a linked heading lands below the pinned masthead', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto('/install/#run-it-from-source');

  const banner = await page.getByRole('banner').boundingBox();
  const heading = await page.locator('#run-it-from-source').boundingBox();
  expect(heading!.y).toBeGreaterThanOrEqual(banner!.y + banner!.height);
});
