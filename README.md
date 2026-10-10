# sudo-play-docs

The documentation site for [Sudo Play](https://github.com/albertoarena/sudo-play),
a macOS menu bar app that suggests today's Spotify playlist for the mood you are
coding in.

Lives at **https://sudoplay.dev**.

## Status

Early. The Astro site is scaffolded but not designed. Its home page carries the
same copy as the placeholder. `placeholder/index.html` is a single static page,
with no build step and no third party request, and it is what the domain serves
until the Astro build replaces it.

`docs/SCOPE.md` is the plan: what is decided, what is deliberately excluded,
and what is still open.

## Develop

Needs Node 22.12 or later.

```sh
npm install
npx playwright install chromium   # once
npm run dev                       # http://localhost:4321
npm test                          # build, then the smoke tests
```

`npm test` builds the site and runs Playwright against the preview server. It
checks that the home page renders its heading and that **no built page makes a
third party request before consent**. New pages are picked up from `dist/`
without editing the test.

## Layout

```
src/           the Astro site
tests/         Playwright smoke tests
placeholder/   a single static page, no build, no external requests
docs/          the plan for this repository
```

## The one rule worth knowing before contributing

Nothing Google-related, and no third party request of any kind, enters a page
before the visitor has explicitly accepted. That is stricter than the usual
Consent Mode setup and it constrains the design, not just the analytics: no
font from a CDN, no iframe demo, no search widget that calls home on load.
`docs/SCOPE.md` explains why.
