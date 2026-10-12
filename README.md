# sudo-play-docs

The documentation site for [Sudo Play](https://github.com/albertoarena/sudo-play),
a macOS menu bar app that suggests today's Spotify playlist for the mood you are
coding in.

Lives at **https://sudoplay.dev**.

## Status

Phases 1 to 5 of `docs/PLAN.md` are done: tooling and tests, the design, the
copy for all six pages, SEO basics, and GA4 behind the consent gate. Phase 6,
the deploy, is next. Analytics are on only in a build with
`PUBLIC_GA_MEASUREMENT_ID` set, and the real ID is still to come.
`placeholder/index.html` is a single static page, with no build step and no
third party request, and it is what the domain serves until phase 6 deploys
the Astro build over it.

`docs/SCOPE.md` says what is decided, what is deliberately excluded and why.
`docs/PLAN.md` says the phases and what is still open.

## Develop

Needs Node 22.12 or later (`.nvmrc` says 22).

```sh
npm ci
npx playwright install chromium   # once
npm run dev                       # http://localhost:4321
npm run check                     # build once, then every test
```

| Script | What it does |
| --- | --- |
| `npm run build` | `astro check`, then `astro build` into `dist/`. Set `PUBLIC_GA_MEASUREMENT_ID` for a build with analytics |
| `npm run build:consent` | A second build into `dist-consent/`, with the test measurement ID `G-TESTING000`, for the consent tests |
| `npm test` | Vitest checks on `dist/`: titles and canonicals, the design tokens and fonts, the copy on each page, no placeholder text, and the SEO files and tags |
| `npm run test:e2e` | Playwright against the preview server: the shell, navigation, focus, the 320px width, axe in light and dark, and **no built page makes a third party request before consent**. A second project serves `dist-consent/` and tests the banner: accept, decline and withdraw |
| `npm run check` | Both builds, then both suites. CI runs this |
| `npm run og:image` | Draws `public/og.png`, the link preview image, with Playwright. On macOS only, by hand, when the design or the tagline changes. Commit the PNG |
| `npm run check:catalog` | Compares `src/data/catalog.ts` with the app's catalog in `../sudo-play` (or a path given as an argument). By hand, at each release |

`npm test` and `npm run test:e2e` read `dist/` and `dist-consent/` and do not
build them, so run both builds first or use `npm run check`. Both pick up new pages from
`dist/` without editing a test.

## Layout

```
src/           the Astro site
tests/         Vitest checks on the built site
e2e/           Playwright tests on the served site
scripts/       check-catalog.ts and og-image.ts, run by hand
placeholder/   a single static page, no build, no external requests
docs/          the scope and the plan for this repository
```

## The one rule worth knowing before contributing

Nothing Google-related, and no third party request of any kind, enters a page
before the visitor has explicitly accepted. That is stricter than the usual
Consent Mode setup and it constrains the design, not just the analytics: no
font from a CDN, no iframe demo, no search widget that calls home on load.
`docs/SCOPE.md` explains why.
