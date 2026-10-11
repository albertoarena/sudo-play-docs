import { expect, test } from '@playwright/test';
import { builtPages } from './pages';

// The narrowest phone the site supports. Nothing may scroll sideways; code
// that is too wide scrolls inside its own block instead.
test.use({ viewport: { width: 320, height: 640 } });

for (const colorScheme of ['light', 'dark'] as const) {
  for (const path of builtPages()) {
    test(`${path} fits 320px without scrolling sideways, ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test('each part of the panel command stays on one line at 320px', async ({ page }) => {
  await page.goto('/');
  const parts = page.getByTestId('terminal-panel').locator('.part');

  expect(await parts.count()).toBeGreaterThan(0);
  for (const part of await parts.all()) {
    const lines = await part.evaluate((el) => el.getClientRects().length);
    expect(lines, await part.textContent() ?? '').toBe(1);
  }
});

test('the nav wraps into compact rows at 320px', async ({ page }) => {
  await page.goto('/install/');
  const nav = await page.getByRole('navigation', { name: 'Site' }).boundingBox();

  // Five links fit in two rows; each row stays a comfortable target without
  // the full band padding of a wide screen.
  expect(nav!.height).toBeLessThanOrEqual(80);
});

test('no nav row holds a single link at 320px', async ({ page }) => {
  await page.goto('/install/');
  const tops = await page
    .getByRole('navigation', { name: 'Site' })
    .getByRole('link')
    .evaluateAll((links) => links.map((link) => Math.round(link.getBoundingClientRect().top)));
  const rows = new Map<number, number>();
  for (const top of tops) rows.set(top, (rows.get(top) ?? 0) + 1);

  expect([...rows.values()].every((count) => count > 1), JSON.stringify([...rows])).toBe(true);
});

test('a code block that scrolls shows an edge fade', async ({ page }) => {
  await page.goto('/how-it-works/');
  const pre = page.locator('figure.code-block pre').first();
  const scrolls = await pre.evaluate((el) => el.scrollWidth > el.clientWidth);
  const style = await pre.evaluate((el) => {
    const s = getComputedStyle(el);
    return { image: s.backgroundImage, attachment: s.backgroundAttachment };
  });

  // macOS hides scrollbars until you scroll, so the fade is the only sign.
  expect(scrolls).toBe(true);
  expect(style.image).toContain('linear-gradient');
  expect(style.attachment).toContain('local');
});

// The panel wraps the way the app does: a flag never ends a line, because
// "--genre rock" and "--mood debugging" are parts that never split.
for (const width of [320, 375, 768]) {
  test(`the panel never ends a line on a flag at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');

    const lines = await page.getByTestId('terminal-panel').locator('.line').evaluate((el) => {
      const rows = new Map<number, string>();
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        for (let i = 0; i < node.textContent!.length; i++) {
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const rect = range.getClientRects()[0];
          if (!rect) continue;
          const top = Math.round(rect.top);
          rows.set(top, (rows.get(top) ?? '') + node.textContent![i]);
        }
      }
      return [...rows.values()].map((row) => row.trim());
    });

    for (const line of lines) {
      expect(line, JSON.stringify(lines)).not.toMatch(/--(genre|mood)$/);
    }
  });
}
