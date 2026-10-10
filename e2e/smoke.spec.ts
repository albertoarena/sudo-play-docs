import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { expect, test } from '@playwright/test';

// Every built page, read from dist/ so a new page is covered without editing
// this file. `npm run check` builds the site before Playwright collects tests.
function builtPages(dir = 'dist'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return builtPages(path);
    if (!entry.name.endsWith('.html')) return [];
    const url = '/' + relative('dist', path).split(sep).join('/');
    return [url.replace(/(^|\/)index\.html$/, '$1')];
  });
}

test('the home page renders its heading', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Sudo Play' })).toBeVisible();
});

test('the site has at least one built page', () => {
  expect(builtPages()).toContain('/');
});

// The consent promise: no third party request of any kind before an explicit
// accept. This is the only automated guard that promise has.
for (const path of builtPages()) {
  test(`${path} makes no third party request before consent`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL!).origin;
    const thirdParty: string[] = [];

    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol === 'data:' || url.protocol === 'blob:') return;
      if (url.origin !== origin) thirdParty.push(request.url());
    });

    await page.goto(path, { waitUntil: 'networkidle' });

    expect(thirdParty).toEqual([]);
  });
}
