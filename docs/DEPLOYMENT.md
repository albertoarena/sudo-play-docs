# Deployment

How sudoplay.dev gets from `main` to the host. Phase 6 of
[`PLAN.md`](PLAN.md), built on 2026-10-14. It is the model trussphp.com uses on
the same Netsons host.

## The path

1. A pull request merges into `main`, and CI runs `npm run check`.
2. If CI passes, `.github/workflows/publish.yml` builds the site with
   `PUBLIC_GA_MEASUREMENT_ID` from the repository variable, and force pushes
   `dist/` to the `deploy` branch, as one commit. It builds the commit CI
   tested. A red `main` never reaches the host.
3. Every 5 minutes, cron on the host runs `scripts/server-deploy.sh`. When the
   `deploy` branch has a commit it has not deployed, the script unpacks it into
   `~/sudoplay.dev/releases/<timestamp>/`, points the `current` symlink at it,
   and keeps the newest three releases.
4. The docroot `.htaccess` serves every request from `current/`.

CI never connects to the host, and holds no credentials for it. The host
connects out to GitHub, over HTTPS, with no credentials either. **So the
repository must be public before the first deploy.** Until then the cron job
fails to clone, and the domain keeps serving whatever it served before.

## On the host

```
~/bin/sudoplay-dev-server-deploy.sh   the script, copied from scripts/
~/logs/deploys/sudoplay-dev.log       what each run printed
~/sudoplay.dev/                       the docroot
  .htaccess                           applied by hand from deploy/docroot.htaccess
  .deploy-src/                        a shallow clone of the deploy branch
  .deployed-sha                       the commit now live
  current -> releases/<timestamp>     the live release
  releases/                           the newest three releases
```

Two `.htaccess` files apply, and each has its own job:

- **The docroot's**, `deploy/docroot.htaccess` in this repository. It is a
  reference copy and is never deployed: the live file is applied by hand. It
  refuses `/releases/`, leaves `/.well-known/` to AutoSSL, sends http and www
  to `https://sudoplay.dev`, and then rewrites everything into `current/`.
  Every redirect must sit above that last rewrite, or it never fires. Never
  add a redirect through cPanel's Redirects tool: it lands below the rewrite
  and fails without an error
- **The release's**, `public/.htaccess`. It ships inside every release, so a
  change to it deploys like any other change. It sends `/current/` and
  `/releases/` addresses back to the real ones, folds `index.html` into its
  folder, adds the trailing slash before Apache's `mod_dir` can, and sets the
  404 page to `/current/404.html`

## Setting it up, once

Do these in order. Until step 5, the domain keeps serving the placeholder.

1. **Make the repository public.** Nothing below works before it.
2. **Check the `deploy` branch exists.** Publish runs on the first green push
   to `main` after this workflow merged. If the branch is missing, run Publish
   by hand from the Actions tab.
3. **Install the script.**
   ```sh
   mkdir -p ~/bin ~/logs/deploys
   curl -fsSL https://raw.githubusercontent.com/albertoarena/sudo-play-docs/main/scripts/server-deploy.sh \
     -o ~/bin/sudoplay-dev-server-deploy.sh
   chmod +x ~/bin/sudoplay-dev-server-deploy.sh
   ```
4. **Try it in a scratch folder, then deploy for real.**
   ```sh
   ~/bin/sudoplay-dev-server-deploy.sh ~/sudoplay.dev/_test   # prints "deployed release ..."
   ls -a ~/sudoplay.dev/_test/current/                       # index.html, 404.html, .htaccess ...
   rm -rf ~/sudoplay.dev/_test
   ~/bin/sudoplay-dev-server-deploy.sh                       # the real docroot
   ```
   The old `.htaccess` still serves the placeholder, so nothing visible
   changes yet.
5. **Apply the docroot `.htaccess`.**
   ```sh
   cp ~/sudoplay.dev/.htaccess ~/sudoplay.dev/.htaccess.bak-$(date +%F)
   ```
   Then replace `~/sudoplay.dev/.htaccess` with the rules in
   `deploy/docroot.htaccess`. The site is live from this moment.
6. **Check it, from a checkout:** `npm run check:redirects`. If anything
   fails, restore the `.bak` copy and look again.
7. **Add the cron job,** in cPanel under Cron Jobs:
   ```
   */5 * * * * $HOME/bin/sudoplay-dev-server-deploy.sh >> $HOME/logs/deploys/sudoplay-dev.log 2>&1
   ```
8. **Move the placeholder out of the docroot.** `index.html` and
   `robots.txt` in `~/sudoplay.dev/` are no longer served, because every
   request goes to `current/`, and each release has its own. Keep a copy
   outside the docroot, then delete `placeholder/` from this repository in a
   pull request. Leave `.well-known/` and `cgi-bin/`: they are the host's.

## After a deploy, or any edit to the docroot `.htaccess`

```sh
npm run check:redirects
```

It follows every redirect and fails if any hop shows `/current/` or
`/releases/`, if a hop count or status is wrong, or if the 404 page is not the
site's own. Against the live site it also checks http and www, and that no page
in the sitemap carries the Cloudflare beacon. The text tests in
`tests/deploy.test.ts` cannot do any of this: they prove a rule is in the file,
never that Apache runs it.

To try a change to either `.htaccess` before it reaches the host, run the
checker against a local Apache laid out like the docroot, with
`mod_rewrite` on and `AllowOverride All`:

```sh
npm run check:redirects -- http://localhost:8099
```

Against a local address it skips the http and www cases, which need the live
DNS and certificate.

## Rolling back

- **A bad release:** point `current` at the one before.
  `ln -sfn releases/<older> ~/sudoplay.dev/current`. Cron does not undo it,
  because `.deployed-sha` still names the newest commit. The next merge to
  `main` deploys over it, so revert on `main` too
- **A bad docroot `.htaccess`:** restore the `.bak` copy
- **Deploys stopped:** read `~/logs/deploys/sudoplay-dev.log`. "up to date"
  every 5 minutes is the healthy line
