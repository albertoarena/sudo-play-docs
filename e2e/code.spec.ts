import { expect, test } from '@playwright/test';
import { builtPages } from './pages';

// PRODUCT.md: the tagline is not a command. It is never set as code and never
// offered for copying. Real code sits in a labelled block with a Copy button.
for (const path of builtPages()) {
  test(`${path} never sets the tagline as code`, async ({ page }) => {
    await page.goto(path);
    const code = await page.locator('pre, code').allTextContents();

    expect(code.filter((text) => /sudo\s+play/.test(text))).toEqual([]);
    await expect(page.getByTestId('terminal-panel').getByRole('button')).toHaveCount(0);
  });
}

test.describe('code blocks', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('are labelled and copy their code', async ({ page }) => {
    await page.goto('/how-it-works/');
    const block = page.locator('figure.code-block').first();

    await expect(block.locator('figcaption')).toHaveText('catalog/playlists.yaml');
    const code = await block.locator('pre').textContent();

    await block.getByRole('button', { name: 'Copy' }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);
    await expect(block.getByRole('status')).toHaveText('Copied');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('code blocks show no Copy button', async ({ page }) => {
    await page.goto('/how-it-works/');

    await expect(page.locator('figure.code-block pre')).not.toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Copy' })).toHaveCount(0);
  });
});
