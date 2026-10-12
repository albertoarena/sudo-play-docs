import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { builtPages } from './pages';

// The consent gate, on the build with a test measurement ID (dist-consent/).
// The first half of the promise is the same as smoke.spec.ts: no third party
// request of any kind before an explicit accept, now with the banner showing.
// The second half accepts and expects Google, and only then.
//
// Google is never really contacted: every request to it is answered here
// with an empty script, and recorded.
const id = 'G-TESTING000';
const gtag = `https://www.googletagmanager.com/gtag/js?id=${id}`;
const pages = builtPages('dist-consent');

async function watch(page: Page) {
  const origin = new URL(test.info().project.use.baseURL!).origin;
  const thirdParty: string[] = [];

  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol === 'data:' || url.protocol === 'blob:') return;
    if (url.origin !== origin) thirdParty.push(request.url());
  });
  await page.route('https://www.googletagmanager.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
  );

  return thirdParty;
}

function banner(page: Page) {
  return page.getByRole('region', { name: 'Analytics, only if you agree' });
}

test('the consent build has every page', () => {
  expect(pages).toEqual(builtPages('dist'));
});

for (const path of pages) {
  test(`${path} asks first and makes no third party request before consent`, async ({ page }) => {
    const thirdParty = await watch(page);
    await page.goto(path, { waitUntil: 'networkidle' });

    await expect(banner(page)).toBeVisible();
    expect(thirdParty).toEqual([]);
  });
}

test('accepting loads Google Analytics once, and only then', async ({ page }) => {
  const thirdParty = await watch(page);
  await page.goto('/install/', { waitUntil: 'networkidle' });
  expect(thirdParty).toEqual([]);

  await banner(page).getByRole('button', { name: 'Accept analytics' }).click();

  await expect(banner(page)).toHaveCount(0);
  await expect.poll(() => thirdParty).toEqual([gtag]);
  const consent = await page.evaluate(() =>
    ((window as unknown as { dataLayer: IArguments[] }).dataLayer ?? [])
      .map((args) => Array.from(args))
      .find((call) => call[0] === 'consent'),
  );
  expect(consent).toEqual([
    'consent',
    'default',
    { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' },
  ]);
});

test('an accept is remembered: the next page loads Google with no banner', async ({ page }) => {
  const thirdParty = await watch(page);
  await page.goto('/');
  await banner(page).getByRole('button', { name: 'Accept analytics' }).click();
  await page.goto('/moods/', { waitUntil: 'networkidle' });

  await expect(banner(page)).toHaveCount(0);
  expect(thirdParty).toEqual([gtag, gtag]);
});

test('declining contacts no one, now or on the next page', async ({ page }) => {
  const thirdParty = await watch(page);
  await page.goto('/');
  await banner(page).getByRole('button', { name: 'Decline' }).click();

  await expect(banner(page)).toHaveCount(0);
  await page.goto('/tips/', { waitUntil: 'networkidle' });

  await expect(banner(page)).toHaveCount(0);
  expect(thirdParty).toEqual([]);
});

// Consent that cannot be taken back is not consent.
test('the footer withdraws an accept, and the page loads nothing after', async ({ page }) => {
  await page.goto('/');
  await banner(page).getByRole('button', { name: 'Accept analytics' }).click();

  const thirdParty = await watch(page);
  await page.getByRole('contentinfo').getByRole('button', { name: 'Analytics settings' }).click();
  await page.waitForLoadState('networkidle');

  await expect(banner(page)).toBeVisible();
  expect(thirdParty).toEqual([]);
});

test('the build without an ID has no Analytics settings in the footer', async ({ page }) => {
  await page.goto('http://localhost:4321/');

  await expect(page.getByRole('button', { name: 'Analytics settings' })).toHaveCount(0);
});

// Refusing must be as easy as agreeing: same size, same place, same weight.
test('Decline and Accept are the same size', async ({ page }) => {
  await page.goto('/');
  const decline = await banner(page).getByRole('button', { name: 'Decline' }).boundingBox();
  const accept = await banner(page).getByRole('button', { name: 'Accept analytics' }).boundingBox();

  expect(decline!.height).toBe(accept!.height);
  expect(Math.abs(decline!.width - accept!.width)).toBeLessThanOrEqual(1);
});

// Neither answer is styled as the one the site wants: no fill, colour or
// weight sets Accept apart. Decided 2026-10-12.
test('Decline and Accept look the same', async ({ page }) => {
  await page.goto('/');
  const look = (name: string) =>
    banner(page)
      .getByRole('button', { name })
      .evaluate((button) => {
        const style = getComputedStyle(button);
        return [style.backgroundColor, style.color, style.borderColor, style.fontWeight, style.fontSize];
      });

  expect(await look('Accept analytics')).toEqual(await look('Decline'));
});

test('the banner links to the Privacy page', async ({ page }) => {
  await page.goto('/');

  await expect(banner(page).getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy/');
});

// The banner overlays the page, so the footer makes room for it while it
// shows: nothing at the end of a page is hidden under it.
test('the banner covers nothing at the end of a page', async ({ page }) => {
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 640 });
    await page.goto('/privacy/');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

    const top = (await banner(page).boundingBox())!.y;
    const footer = await page.getByRole('contentinfo').locator('p').boundingBox();
    expect(footer!.y + footer!.height, `${width}px`).toBeLessThanOrEqual(top);
  }
});

test('the banner fits 320px without scrolling sideways', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  await expect(banner(page)).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`the banner passes axe, ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/how-it-works/');
    await expect(banner(page)).toBeVisible();

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();

    expect(violations.map(({ id, nodes }) => `${id}: ${nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
  });
}
