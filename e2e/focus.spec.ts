import { expect, test } from '@playwright/test';

// Focus is authored: a solid outline of at least 2px in the palette's focus
// colour, never the browser default. Inside the dark band it is --term-focus.
const termFocus = 'rgb(0, 212, 146)';
const focus = { light: 'rgb(0, 122, 85)', dark: 'rgb(0, 212, 146)' };

for (const colorScheme of ['light', 'dark'] as const) {
  test(`every focus stop shows an authored outline, ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/how-it-works/');

    const stops = await page.locator('a[href], button').count();
    for (let i = 0; i < stops; i++) {
      await page.keyboard.press('Tab');
      const ring = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const style = getComputedStyle(el);
        return {
          name: el.textContent?.trim().slice(0, 40),
          inBand: !!el.closest('.masthead') || el.classList.contains('skip-link'),
          visible: el.getBoundingClientRect().height > 0,
          style: style.outlineStyle,
          width: parseFloat(style.outlineWidth),
          color: style.outlineColor,
        };
      });

      expect(ring.visible, ring.name).toBe(true);
      expect(ring.style, ring.name).toBe('solid');
      expect(ring.width, ring.name).toBeGreaterThanOrEqual(2);
      expect(ring.color, ring.name).toBe(ring.inBand ? termFocus : focus[colorScheme]);
    }
  });
}

test('the skip link appears on focus and moves focus to main', async ({ page }) => {
  await page.goto('/install/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });

  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await skip.press('Enter');
  await expect(page).toHaveURL(/#content$/);
});

test('the skip link keeps its text readable on hover', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto('/install/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await skip.hover();

    const [color, fill] = await skip.evaluate((el) => {
      const style = getComputedStyle(el);
      return [style.color, style.backgroundColor];
    });
    const onAccent = colorScheme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(9, 9, 11)';
    expect(color, `${colorScheme} on ${fill}`).toBe(onAccent);
  }
});
