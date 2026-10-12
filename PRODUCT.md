# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People on a Mac who have already found Sudo Play, from the app's GitHub README
or from hearing the domain said out loud. They come to install it, to learn
what the moods mean, to get a few tips, and to check what the app and this
site do with their data. They are mostly developers. They are not being sold
to and the site does not need to persuade them.

## Product Purpose

`sudoplay.dev` is the documentation site for Sudo Play, a small macOS menu bar
app that picks today's Spotify playlist from a genre and a developer mood
("Friday Deploy", "Debugging"). The pick is the same all day and the same for
everyone with the same genre and mood, and it changes tomorrow.

Success: a visitor installs the app, understands the moods, and trusts what it
does with their data, without reading more than they need to.

## Positioning

The site documents the shipped release of one specific app, and nothing more.
The app repository is authoritative: if the two disagree, the app is right and
the site is the bug to fix. Work merged in the app but not yet released does not
belong here.

## Operating Context

- Pages at launch: Home, How it works, Install, Moods, Tips, and Privacy (about
  this site, not the app)
- Moods are copied from the app's `catalog/playlists.yaml` at each release
- The app's `README.md`, `CONTRIBUTING.md` and `PRIVACY.md` are linked, never
  copied, so there are never two versions to drift
- Not in v1: search, a changelog, a blog, a demo, translations

## Capabilities and Constraints

- Plain Astro, strict TypeScript, no Starlight, no CSS or UI framework
- **No third party request of any kind before consent**, on every page. No CDN
  or hosted font, no remote icon set, no embed, no iframe, no search widget that
  calls home. Fonts are self hosted in this repository
- GA4 sits behind an explicit consent gate, built in phase 5. It is switched
  on by setting `PUBLIC_GA_MEASUREMENT_ID` at build time; unset, no banner and
  nothing Google related is on the page. Advertising consent stays denied for
  ever
- One canonical host, `https://sudoplay.dev`, HSTS preloaded
- The repository is private now and public later, so nothing committed may be a
  secret or draft copy worth hiding
- Open: who writes the tips, and the licence for the site content

## Brand Commitments

- The app's look carries over: "a terminal on a quiet page". The colour scheme
  is shared with the app and recorded in `docs/DIRECTION.md`
- **The tagline is not a command.** `$ sudo play --mood friday-deploy` and its
  variants are the brand line, shown in the dark terminal panel. No page may
  present it as something to type. Real code (the YAML catalog entry, any shell
  step) is styled as a code block, distinct from the panel, so nobody copies the
  tagline into a terminal
- The app's mark (a dim `>` prompt and three green equaliser bars, from
  `sudo-play/art/`) is the site's logo and favicon, copied into this repository
- The name, the tagline, the art and the design and copy of sudoplay.dev are
  covered by the app's `TRADEMARK.md`, not by MIT
- Voice: plain English, short sentences, no em dashes and no en dashes
- Sudo Play is not affiliated with Spotify. The app's privacy promise (no
  accounts, no analytics, no tracking) is a promise about the app, and any copy
  that states it names the app explicitly

## Evidence on Hand

- App icon and menu bar mark: `../sudo-play/art/`
- Moods and their one line descriptions: the app's README and catalog
- No screenshots, testimonials or download counts. The app has no release yet,
  so the Install page is rechecked after the first signed release. Do not
  invent any of these

## Product Principles

1. The app is the source of truth. The site follows it and never runs ahead
2. Link, do not copy. One version of every text
3. Nothing leaves the visitor's browser before they say yes
4. Say it once, plainly, and stop
5. Same hands as the app: anyone who has seen the popover recognises the site

## Accessibility & Inclusion

WCAG 2 AA. Authored, visible focus everywhere. Works at 320px wide with no
horizontal scroll. Light and dark follow `prefers-color-scheme`. The app reads
moods by name without the emoji, and the site does the same.
