# AGENTS.md

## What this is

The documentation website for **Sudo Play**, the macOS menu bar app at
[`albertoarena/sudo-play`](https://github.com/albertoarena/sudo-play).
Published at **https://sudoplay.dev**. This repository contains only the site.
The app, its source, its tests and its own `README.md`, `CONTRIBUTING.md` and
`PRIVACY.md` live in the app repository.

Read `docs/SCOPE.md` before starting anything. It records what is decided, what
is deliberately excluded and what is still open, and most of the questions a
new session has are answered there.

## Current state, so nothing is assumed

Phases 1 to 5 of `docs/PLAN.md` are done. Plain Astro with strict TypeScript,
no Starlight and no CSS framework. The design, made with Impeccable, is in
`docs/DIRECTION.md` (the decisions) and `DESIGN.md` (as built). All six pages
have real copy, and a test fails if any page still carries the
`data-placeholder` marker. `placeholder/index.html` is still what the domain
serves. Phase 6, the deploy, is next.

GA4 and the consent gate, from phase 5: `src/data/analytics.ts` reads the
measurement ID from `PUBLIC_GA_MEASUREMENT_ID` at build time. Unset, the build
has no banner, no footer control and no script. The choice lives in
`src/scripts/consent.ts` and the loader in `src/scripts/analytics.ts`, both
ported with their tests from `laravel-truss-docs`. The banner is
`src/components/ConsentBanner.astro`, and its one inline script also wires
Analytics settings in the footer. The deploy build sets the ID from a
repository variable, and it never goes in the code. `docs/PLAN.md` records it.

SEO, from phase 4: every page passes a `description` to `Base`, which also
writes the Open Graph tags. `src/pages/sitemap.xml.ts` builds the sitemap from
`src/data/nav.ts`, so a new page is added there and nowhere else.
`public/robots.txt` allows every crawler. The 404 is the one `noindex` page,
with no canonical. `public/og.png` is the one preview image: when the design
or the tagline changes, run `npm run og:image` on a Mac and commit the PNG.

The copy describes the app at the commit in `src/data/release.ts`
(`checkedAt`). The app has no release yet, so `release` is `null`, and every
page states the release through `releaseNote()`. A test forbids writing "no
release" anywhere else. When the first release ships, fill in `release` there,
then recheck the Install steps against the real build.

The moods and genres are copied into `src/data/catalog.ts` from the app's
`catalog/playlists.yaml`. `npm run check:catalog` compares the copy with a
local `sudo-play` checkout at `checkedAt`. Run it by hand at each release: CI
has no app checkout.

Work is test first: the failing test is committed, then the code, one commit
per green cycle.

`docs/PLAN.md` holds the phases and the answered questions. The code is MIT
(`LICENSE`) and the text of the pages and `public/og.png` are CC BY 4.0
(`LICENSE-CONTENT`); the README says which covers what.

This repository is **private now and public later**. Everything committed while
it is private is readable the moment it flips, so no credentials and no draft
copy worth hiding. A GA4 measurement ID is public by nature and is not a secret.

## Source of truth: the app drives the docs

This site documents the app, and its content must be kept in sync with it.
When the app changes a command, a setting or any user facing behaviour, the
page here changes to match. **The app repository is authoritative: if the two
disagree, the app is right and this site is the bug to fix.**

**The site documents the shipped release, not the app's `main`.** Sudo Play
ships as a signed build rather than a package, so there is no release for this
repository to read from automatically. The update is manual and lands with the
release. Work merged in the app but not yet released does not belong here.

One thing to decide rather than drift into: the app already has `README.md`,
`CONTRIBUTING.md` and `PRIVACY.md`. Copying them here creates two versions of
the same text that fall out of step. Prefer linking, and reserve this site for
what it genuinely adds. This is open question 3 in `docs/SCOPE.md`.

## The consent rule, which constrains the design and not just the analytics

Nothing Google related, and **no third party request of any kind**, enters a
page before the visitor has explicitly accepted. This is stricter than the usual
Consent Mode setup, which loads `gtag.js` immediately with consent denied: that
sets no cookie but still sends a request carrying the visitor's IP.

Before writing any analytics, read `laravel-truss-docs/src/scripts/analytics.js`.
Its header explains the choice and the tests beside it are the specification.

**What this rules out, on every page including the placeholder:** a font from a
CDN, an iframe demo, a search widget that calls home on load, an embedded map,
a hosted icon set. Decide it when choosing the design, not afterwards.
Retrofitting the promise means pulling out furniture that already works.

`ad_storage`, `ad_user_data` and `ad_personalization` stay denied for ever. The
site has no advertising and should never acquire any.

**Before quoting any number this produces:** GA4 behind this gate counts
acceptors, not visitors, so every figure is a floor. Developers decline consent
and run blockers more than most audiences.

## The placeholder

`placeholder/index.html` is static, buildless and makes no external request. It
exists so the domain is not empty while the real site is written, and it is
deliberately small so it cannot rot.

- **No analytics on it.** It has nothing worth measuring, and adding the consent
  machinery for a holding page means writing that machinery twice
- **Do not promote it.** A social card is warmed per page, and a cold URL draws
  nothing on its first paste, so a post spent on a placeholder spends the
  domain's first impression on an empty page
- Replace it with the real site rather than growing it into one

## Testing

`laravel-truss-docs` has **no browser test at all**, and a docs site is mostly
rendered output, which is exactly what unit tests do not see.

**The first Astro commit includes a smoke test.** Not the commit after it. At
minimum: the site builds, the home page renders its heading, and no page issues
a third party request before consent. The last of those is the only automated
guard the consent promise will ever have.

There are two suites, and `npm run check` builds and runs both, locally and in
CI. It builds twice: `dist/` with no measurement ID, and `dist-consent/` with
the test ID `G-TESTING000`:

- `tests/`, Vitest in a node environment, checks the files in `dist/`: the
  home page exists, every page has a non empty `<title>` and exactly one
  canonical on `https://sudoplay.dev` (the 404 has none), and the SEO files
  and tags are in place. Run it with `npm test`
- `e2e/smoke.spec.ts`, Playwright, checks the served site: the home page
  renders its heading, and no page makes a third party request before
  consent. Run it with `npm run test:e2e`
- `e2e/consent.spec.ts` runs in its own Playwright project against
  `dist-consent/`, on port 4322. Every page shows the banner and makes no third
  party request before a choice; accept loads gtag once, decline contacts no
  one, and the footer withdraws. Google is answered by the test with an empty
  script and never contacted

Neither script builds on its own: run `npm run build` and
`npm run build:consent` first, or use `npm run check`.

The consent check visits every HTML file in `dist/`, so a new page is covered
without touching the test. Do not weaken it to make a page pass: remove the
request instead. The second half, in `e2e/consent.spec.ts`, accepts consent and
expects Google, and it checks the first half again with the banner showing.

If a machine has a Chromium that does not match the Playwright version, set
`PLAYWRIGHT_CHROMIUM_PATH` to it instead of downloading another.

## Infrastructure that is already decided

- **`sudoplay.dev`, hyphenless.** `sudo-play.dev` was deliberately not bought.
  If it ever is, it 301s and never serves a page: two live hosts means two
  Search Console properties, a split canonical and a card cache warmed on the
  wrong address
- **`.dev` is HSTS preloaded at the registry**, so there is no HTTP fallback.
  Every link, canonical and `og:url` is `https://sudoplay.dev`
- **DNS stays DNS only and is never CDN proxied.** On `trussphp.com` on
  2026-08-15, proxying made every request reach the origin from a handful of
  shared edge IPs, the origin's WAF read them as one abusive client, and every
  non browser client including AI answer engine fetchers got a JavaScript
  interstitial instead of the page for three days. A browser saw a healthy site
  throughout, so nothing surfaced it

## Working in this repository

**Everything goes through a branch and a pull request.** Prose, a typo, a
component, a workflow, this file. There is no change small enough to push
straight to `main`.

`main` is not protected yet, because protection needs a public repository or a
paid plan. That makes the rule more important rather than less: nothing but the
rule is enforcing it.

Do not change the repository's visibility. Alberto flips it, and the app
repository waits on this site serving something real first.

## Conventions

- Prose and UI copy: plain English, short sentences, **no em dashes and no en
  dashes**. If quoted material from someone else contains them, reproduce it
  verbatim: never edit another person's words to fit our punctuation
- Never commit generated or fetched directories: `dist/`, `.astro/`,
  `node_modules/`
- Personal notes and planning live in `.docs/`, which is gitignored and
  therefore not backed up. Anything that must survive belongs in a committed
  file or in the private notes repository
- **Git commits:** `type: short subject`, 50 characters or fewer, then a body
  explaining what and why rather than how. Use a heredoc for multi-line
  messages
- **Never add AI attribution** to a commit or a pull request description. No
  `Co-Authored-By`, no `Claude-Session`, no "Generated with Claude Code". If a
  pull request opened from a cloud session carries a footer anyway, it was
  added by the egress proxy after the body was sent and has to be stripped from
  outside that session
- **Pull requests are short.** What changed, why, and anything the reviewer has
  to decide. The commits carry the depth, and a long description is the same
  story told twice, with the second telling the one that goes stale
