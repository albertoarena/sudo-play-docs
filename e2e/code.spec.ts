import { expect, test } from '@playwright/test';
import { builtPages } from './pages';

// PRODUCT.md: the tagline is not a command. It is never set as code and never
// offered for copying.
for (const path of builtPages()) {
  test(`${path} never sets the tagline as code`, async ({ page }) => {
    await page.goto(path);
    const code = await page.locator('pre, code').allTextContents();

    expect(code.filter((text) => /sudo\s+play/.test(text))).toEqual([]);
    await expect(page.getByTestId('terminal-panel').getByRole('button')).toHaveCount(0);
  });
}
