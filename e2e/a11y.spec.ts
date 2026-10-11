import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { builtPages } from './pages';

// axe runs inside the test browser and makes no request. It checks landmarks,
// names, roles and the contrast of the rendered page, in both schemes.
for (const colorScheme of ['light', 'dark'] as const) {
  for (const path of builtPages()) {
    test(`${path} passes axe, ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);

      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();

      expect(violations.map(({ id, nodes }) => `${id}: ${nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
    });
  }
}
