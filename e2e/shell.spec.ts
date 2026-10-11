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
