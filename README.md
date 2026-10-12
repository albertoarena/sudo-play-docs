# sudo-play-docs

The documentation site for [Sudo Play](https://github.com/albertoarena/sudo-play),
a macOS menu bar app that suggests today's Spotify playlist for the mood you are
coding in.

Lives at **https://sudoplay.dev**.

## Status

Phases 1 to 3 of `docs/PLAN.md` are done: tooling and tests, the design, and
the copy for all six pages. Phase 4, SEO basics, is next.
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
| `npm run build` | `astro check`, then `astro build` into `dist/` |
| `npm test` | Vitest checks on `dist/`: titles and canonicals, the design tokens and fonts, the copy on each page, and no placeholder text |
| `npm run test:e2e` | Playwright against the preview server: the shell, navigation, focus, the 320px width, axe in light and dark, and **no built page makes a third party request before consent** |
| `npm run check` | All three, in that order. CI runs this |
| `npm run check:catalog` | Compares `src/data/catalog.ts` with the app's catalog in `../sudo-play` (or a path given as an argument). By hand, at each release |

`npm test` and `npm run test:e2e` read `dist/` and do not build it, so run
`npm run build` first or use `npm run check`. Both pick up new pages from
`dist/` without editing a test.

## Layout

```
src/           the Astro site
tests/         Vitest checks on the built site
e2e/           Playwright tests on the served site
scripts/       check-catalog.ts, run by npm run check:catalog
placeholder/   a single static page, no build, no external requests
docs/          the scope and the plan for this repository
```

## The one rule worth knowing before contributing

Nothing Google-related, and no third party request of any kind, enters a page
before the visitor has explicitly accepted. That is stricter than the usual
Consent Mode setup and it constrains the design, not just the analytics: no
font from a CDN, no iframe demo, no search widget that calls home on load.
`docs/SCOPE.md` explains why.
