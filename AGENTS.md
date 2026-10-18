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

Phases 1 to 6 of `docs/PLAN.md` are done, and https://sudoplay.dev is live
since 2026-10-14. Plain Astro with strict TypeScript,
no Starlight and no CSS framework. The design, made with Impeccable, is in
`docs/DIRECTION.md` (the decisions) and `DESIGN.md` (as built). All six pages
have real copy, and so does Credits, linked from the footer (2026-10-13), and a test fails if any page still carries the
`data-placeholder` marker. A merge to `main` deploys itself: read
`docs/DEPLOYMENT.md` before touching `publish.yml`, `scripts/server-deploy.sh`
or either `.htaccess`, and run `npm run check:redirects` after any change to
them.

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
(`checkedAt`). Since 2026-10-15 `release` is 1.0.2, signed and notarized, the
1.0.1 app repackaged. The signed 1.0.0 replaced the unsigned 1.0.0 beta 1 on
2026-10-14. Every page states the
release through `releaseNote()`, and a test forbids writing "no release"
anywhere else. For each new release, update `release` there and `checkedAt`,
then recheck the Install steps against the real build.

The moods and genres are copied into `src/data/catalog.ts` from the app's
`catalog/playlists.yaml`. `npm run check:catalog` compares the copy with a
local `sudo-play` checkout at `checkedAt`. Run it by hand at each release, and
at each catalog change after moving `checkedAt` to the app commit that made
it: CI has no app checkout.

Work is test first: the failing test is committed, then the code, one commit
per green cycle.

`docs/PLAN.md` holds the phases and the answered questions. The code is MIT
(`LICENSE`) and the text of the pages and `public/og.png` are CC BY 4.0
(`LICENSE-CONTENT`); the README says which covers what.

This repository is **public** since 2026-10-14, so nothing committed may be a
credential or draft copy worth hiding. A GA4 measurement ID is public by nature
and is not a secret. Secret scanning and push protection are on.

## Source of truth: the app drives the docs

This site documents the app, and its content must be kept in sync with it.
When the app changes a command, a setting or any user facing behaviour, the
page here changes to match. **The app repository is authoritative: if the two
disagree, the app is right and this site is the bug to fix.**

**The site documents the shipped release, not the app's `main`.** Sudo Play
ships as a signed build rather than a package, so there is no release for this
repository to read from automatically. The update is manual and lands with the
release. Work merged in the app but not yet released does not belong here.

**Catalog changes are the exception.** A new mood, genre or playlist in the
app's `catalog/playlists.yaml` reaches the shipped apps through `catalog-live`
within a day, with no release, so the site follows as soon as it is merged
there. The app's `AGENTS.md` has the same rule from its side.

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

**What this rules out, on every page:** a font from a
CDN, an iframe demo, a search widget that calls home on load, an embedded map,
a hosted icon set. Decide it when choosing the design, not afterwards.
Retrofitting the promise means pulling out furniture that already works.

`ad_storage`, `ad_user_data` and `ad_personalization` stay denied for ever. The
site has no advertising and should never acquire any.

**Before quoting any number this produces:** GA4 behind this gate counts
acceptors, not visitors, so every figure is a floor. Developers decline consent
and run blockers more than most audiences.

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

`main` is protected since 2026-10-14: a pull request and the `Checks` job are
required, for admins too, with no force push and no deletion. Merges are merge
commits only, and GitHub deletes the branch after a merge. The Publish workflow
pushes to `deploy`, which is not protected.

Do not change the repository's settings or visibility unless Alberto asks.

## Conventions

- Prose and UI copy: plain English, short sentences
- **No em dashes and no en dashes, anywhere we write**: page copy, alt text,
  descriptions, docs, code comments, commit messages, pull request titles and
  descriptions, and messages to other sessions. Use a period, a comma, a colon
  or parentheses instead, and a plain hyphen only inside a word or a range in
  code. `tests/dashes.test.ts` checks every built page and every Markdown
  file. Commits and pull requests have no test, so check them before sending.
  If quoted material from someone else contains dashes, reproduce it verbatim:
  never edit another person's words to fit our punctuation
- **Every copy change goes through two passes before Alberto sees it**, in this
  order:
  1. The `humanizer` skill, on the changed text, to remove AI writing tells.
     Return only the final text, and keep every claim, number, name and link
  2. The checklist in [`docs/sentence-clarity.md`](docs/sentence-clarity.md),
     walked item by item on the built page, so each sentence reads once

  A new page gets both passes on all of it. Pull request text and commit
  bodies get the humanizer pass too
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
