# sudo-play-docs

The documentation site for [Sudo Play](https://github.com/albertoarena/sudo-play),
a macOS menu bar app that suggests today's Spotify playlist for the mood you are
coding in.

Lives at **https://sudoplay.dev**.

## Status

Phase 1 of `docs/PLAN.md`: the Astro site is scaffolded, with tooling and smoke
tests only. The home page is a bare document with a title, a canonical and one
heading. There is no design and no copy yet. `placeholder/index.html` is a
single static page, with no build step and no third party request, and it is
what the domain serves until phase 6 deploys the Astro build over it.

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
| `npm test` | Vitest checks on `dist/`: every page has a title and one canonical on `https://sudoplay.dev` |
| `npm run test:e2e` | Playwright against the preview server: the home page heading, and **no built page makes a third party request before consent** |
| `npm run check` | All three, in that order. CI runs this |

`npm test` and `npm run test:e2e` read `dist/` and do not build it, so run
`npm run build` first or use `npm run check`. Both pick up new pages from
`dist/` without editing a test.

## Layout

```
src/           the Astro site
tests/         Vitest checks on the built site
e2e/           Playwright smoke tests
placeholder/   a single static page, no build, no external requests
docs/          the scope and the plan for this repository
```

## The one rule worth knowing before contributing

Nothing Google-related, and no third party request of any kind, enters a page
before the visitor has explicitly accepted. That is stricter than the usual
Consent Mode setup and it constrains the design, not just the analytics: no
font from a CDN, no iframe demo, no search widget that calls home on load.
`docs/SCOPE.md` explains why.
