import { expect, test } from '@playwright/test';
import { pages } from '../src/data/nav';
import { builtPages } from './pages';

const built = builtPages();

test('every page in the reading order is built', () => {
  expect(built).toEqual(expect.arrayContaining(pages.map((page) => page.href)));
});

for (const path of built) {
  test.describe(path, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('every link in the masthead and previous and next resolves', async ({ page, baseURL }) => {
      const hrefs = await page
        .locator('header a[href], nav[aria-label="Previous and next"] a[href]')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href')!));

      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        const url = new URL(href, baseURL);
        if (url.origin !== new URL(baseURL!).origin) continue;
        expect(built, `${href} on ${path}`).toContain(url.pathname);
      }
    });

    test('marks exactly one link as the current page', async ({ page }) => {
      const current = page.locator('[aria-current="page"]');

      await expect(current).toHaveCount(1);
      await expect(current).toHaveAttribute('href', path);
    });
  });
}

pages.forEach((entry, index) => {
  test(`${entry.href} links to its neighbours in reading order`, async ({ page }) => {
    await page.goto(entry.href);
    const pager = page.getByRole('navigation', { name: 'Previous and next' });
    const previous = pages[index - 1];
    const next = pages[index + 1];

    if (previous) await expect(pager.getByRole('link', { name: previous.label })).toHaveAttribute('href', previous.href);
    if (next) await expect(pager.getByRole('link', { name: next.label })).toHaveAttribute('href', next.href);
    await expect(pager.getByRole('link')).toHaveCount((previous ? 1 : 0) + (next ? 1 : 0));
  });
});
