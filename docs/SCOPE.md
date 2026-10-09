# Scope: the Sudo Play documentation site

Written 2026-10-09, the day `sudoplay.dev` was bought.

This file is the plan. It says what the site is, what is already decided, what
is deliberately excluded, and what is still open. It is not a source of truth
about the app: that lives in the `sudo-play` repository.

## What this is

A documentation site for Sudo Play, a macOS menu bar app that suggests a daily
Spotify playlist for the mood you are coding in. The app and its docs are
separate repositories, the same separation as `laravel-truss` and
`laravel-truss-docs`.

The site serves people who have already found the app and want to know how to
install it, how to add a playlist, and what it does with their data. It is not
a marketing site and does not need to persuade anyone.

## Decided

- **Domain: `sudoplay.dev`**, bought 2026-10-09, hyphenless on purpose. The repo
  name is typed by people who already found it; the domain is the one said out
  loud. `sudo-play.dev` was deliberately not bought. If it ever is, it redirects
  with a 301 and never serves a page, because two live hosts means two Search
  Console properties, a split canonical, and a social card cache warmed on the
  wrong address
- **`.dev` is HSTS preloaded at the registry**, so there is no HTTP fallback.
  Every link, canonical and `og:url` is `https://sudoplay.dev`
- **Astro** carries the site
- **The design is original.** The analytics pattern is copied from
  `laravel-truss-docs`; the look is not. Alberto designs it himself
- **This repository is private now and public later.** Everything committed
  while private is readable the moment it flips, so no credentials and no draft
  copy worth hiding. A GA4 measurement ID is public by nature
- **A placeholder page goes up first**, in `placeholder/`, so the domain serves
  something before Astro exists

## The analytics rule, which is a design constraint before it is a feature

GA4, built the way `laravel-truss-docs` builds it. Read
`laravel-truss-docs/src/scripts/analytics.js` before writing any of it; its
header explains the choice and the tests beside it are the specification.

**Nothing Google-related enters the document until an explicit accept.** The
usual Consent Mode setup loads `gtag.js` immediately with consent denied, which
sets no cookie but still sends a request carrying the visitor's IP to a third
country. This pattern refuses that. Two things follow, both intentional:
`analytics_storage` is simply `granted`, because a visitor who has not accepted
never reaches the loader, and there is no `wait_for_update`, because nothing is
loaded to hold. `ad_storage`, `ad_user_data` and `ad_personalization` stay
denied forever; the site has no advertising and should never acquire any.

**The part that shapes the design:** analytics is fine, a third party request
before consent is not. That rules out a font from a CDN, an iframe demo, and a
search widget that phones home on load. Decide it on day one. Retrofitting the
promise means pulling out furniture that already works.

**And before anyone quotes a number from it:** GA4 behind this gate counts
acceptors, not visitors. Every figure is a floor, and developers decline consent
and run blockers more than most audiences.

## Deliberately excluded

- **No analytics on the placeholder.** It has nothing worth measuring and adding
  the consent machinery for it means writing it twice
- **No third party request anywhere**, placeholder included. No hosted font
- **No promotion of the placeholder.** A social card is warmed per page and a
  cold URL draws nothing on its first paste, so a post spent on a placeholder
  spends the domain's first impression on an empty page
- **No CDN proxying on DNS.** DNS only, always. On `trussphp.com` on 2026-08-15,
  proxying made every request reach the origin from a handful of shared edge
  IPs, the origin's WAF read them as one abusive client, and every non browser
  client including AI answer engine fetchers got a JavaScript interstitial
  instead of the page for three days. A browser saw a healthy site throughout,
  so nothing surfaced it

## Testing

`laravel-truss-docs` has no browser test at all, and a docs site is mostly
rendered output, which is exactly what unit tests do not see. **One smoke test
goes in the first Astro commit**, not after the first silently broken page.
At minimum: the site builds, the home page renders its heading, and no page
makes a third party request before consent.

## Deployment, settled 2026-10-09

Netsons shared hosting, through cPanel, on `89.40.172.137`. The same server
already serves `trussphp.com`, `cogway.dev` and `albertoarena.it`.

- **DNS is on Cloudflare, both records DNS only.** Never proxied, matching
  `trussphp.com`. The apex A record and the `www` CNAME both resolve straight
  to the origin
- **One canonical host, `https://sudoplay.dev`.** `www` 301s to it in a single
  hop, over either scheme
- **The certificate is AutoSSL's**, covering `sudoplay.dev`,
  `www.sudoplay.dev` and both `.progettofacile.it` forms
- **The redirect lives in `.htaccess`**, not in cPanel's Redirects tool. The
  rule cPanel generates is an HTTP to HTTPS redirect whose first condition is
  `%{HTTPS} off`, so it can never fire for a browser on a preloaded HSTS
  domain. The www rule was added above it, testing only the host. Do not
  re-add a row in the Redirects tool: cPanel would own the file again and
  regenerate its block

Remaining: `netsons-token.sudoplay.dev` TXT is a verification artefact and can
be deleted.

## Open, and Alberto's to answer

1. ~~Where it deploys.~~ **Answered above on 2026-10-09**
2. **Starlight, or not.** `laravel-truss-docs` has two independent head paths
   because custom pages use a layout and Starlight docs use the `head:` array in
   `astro.config.mjs`. Anything site wide has to go in both, and a fix applied
   to one looks complete if verification only checks a page the other path does
   not serve. That trap exists only because the two share a site. An original
   design may remove the reason for Starlight entirely
3. **What the site actually contains at launch.** The app's own repository
   already holds `README.md`, `CONTRIBUTING.md` and `PRIVACY.md`. Duplicating
   them here creates two copies that drift. Deciding what the site adds, rather
   than repeats, is the real scoping question
4. **Licence for the site content**, which need not match the app's MIT

## Order of work

1. The placeholder, served at `https://sudoplay.dev` ✅ written, not yet deployed
2. Deployment decided and the placeholder live
3. Astro scaffold, with the smoke test in the same commit
4. The design, by Alberto, with the Impeccable skill
5. Content, once question 3 is answered
6. GA4 and the consent gate, ported from `laravel-truss-docs` with its tests
7. The repository goes public

**Sudo Play itself does not go public until this site serves something real.**
Alberto decided that on 2026-10-09, accepting that it may delay the app's
release. A product published with nowhere to send people is harder to fix
afterwards than a release that waits.
