# Plan: the Sudo Play documentation site

Written 2026-10-10. `docs/SCOPE.md` says what the site is and why. This file
says the order the work happens in.

Every phase is test first: the failing test is committed, then the code. One
commit per green cycle.

## Phases

1. **Scaffold and smoke tests.** Tooling only. Plain Astro, a bare home page,
   Vitest checks on `dist/`, a Playwright smoke test, CI. No design and no copy
2. **Design**, by Alberto with Impeccable: tokens, self hosted type, layout,
   light and dark, nav, page shell.
   Tests: the shell is on every page, nav links resolve, basic accessibility,
   no third party request
3. **Content:** Home, How it works, Install, Moods, Tips, and Privacy (about
   this site).
   - Moods are copied from the app's `catalog/playlists.yaml` into `src/data/`
     at each release, with a check script against `../sudo-play`
   - The Install page is rechecked after the app's first signed release
   - The site links to the app's `README.md`, `CONTRIBUTING.md` and
     `PRIVACY.md` and never copies them
4. **SEO basics:** `robots.txt`, sitemap, 404, Open Graph, `og:image`
5. **GA4 and the consent gate**, ported with its tests from
   `laravel-truss-docs`
6. **Deploy** over the placeholder on Netsons, verified live with `curl`, the
   way `trussphp.com` deploys (`albertoarena/laravel-truss-docs`, see its
   `DEPLOYMENT.md`). Decided 2026-10-12:
   - GitHub Actions builds the site on every push to `main` and force pushes
     `dist/` to a `deploy` branch. CI never connects to the server
   - A cron job on the server pulls the `deploy` branch over HTTPS, unpacks it
     into a fresh release folder and points a `current` symlink at it, so a
     release is atomic and a rollback is one symlink
   - The docroot `.htaccess` rewrites traffic to `current/`. It must keep the
     `www` rule from Deployment in `docs/SCOPE.md`
   - The server pulls without credentials, which needs the repository public.
     The site goes live when Sudo Play goes public, so the two arrive together

## Open

- **The GA4 measurement ID.** Blocks phase 5
- ~~Who writes the tips.~~ **Answered on 2026-10-12:** Claude drafts them
  from the app's README, `PRIVACY.md` and code, and Alberto approves them.
  If a release has nothing to add, Tips can wait
- **The licence for the site content.** Blocks making the repository public

## Not in v1

Search, a changelog, a blog, a demo, translations.
