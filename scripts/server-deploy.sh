#!/bin/bash
# The pull deploy for sudoplay.dev. It runs on the host, from cron, never in CI.
#
# It fetches the `deploy` branch of albertoarena/sudo-play-docs over HTTPS,
# which CI rebuilds on every green push to main. When the branch has a commit it
# has not deployed, it unpacks that commit into a new releases/<timestamp>/,
# points the `current` symlink at it, and keeps the newest three releases. The
# switch is one symlink, so a visitor never sees half a release. Running it
# again with nothing new does nothing, so cron can call it every few minutes.
#
# The host connects out, so nothing connects in: CI holds no server
# credentials. The clone needs none either, which is why the repository must be
# public before the first deploy. docs/DEPLOYMENT.md has the setup.
#
# Usage: server-deploy.sh [BASE_DIR]
#   BASE_DIR is the docroot, $HOME/sudoplay.dev by default. Pass a scratch
#   folder to try it without touching the live `current` symlink.
#   DEPLOY_REPO overrides the repository, for the tests.
set -euo pipefail

# cron starts with a minimal PATH. cPanel keeps git in its 3rdparty bin.
export PATH="/usr/local/cpanel/3rdparty/lib/path-bin:/usr/local/bin:/usr/bin:/bin:${PATH:-}"

BASE="${1:-$HOME/sudoplay.dev}"
REPO="${DEPLOY_REPO:-https://github.com/albertoarena/sudo-play-docs.git}"
BRANCH="deploy"
SRC="$BASE/.deploy-src"
STAMP="$BASE/.deployed-sha"

mkdir -p "$BASE"

# A shallow copy of the deploy branch alone. The fetch is forced because CI
# rewrites the branch on every publish.
if [ ! -d "$SRC/.git" ]; then
  git clone --quiet --branch "$BRANCH" --single-branch --depth 1 "$REPO" "$SRC"
else
  git -C "$SRC" fetch --quiet --depth 1 --force origin "$BRANCH:refs/remotes/origin/$BRANCH"
fi

NEW="$(git -C "$SRC" rev-parse "origin/$BRANCH")"
OLD="$(cat "$STAMP" 2>/dev/null || echo none)"
if [ "$NEW" = "$OLD" ]; then
  echo "up to date ($NEW)"
  exit 0
fi

# A clean release from the commit itself: no .git, and no file left over from
# an earlier one.
TS="$(date -u +%Y%m%d%H%M%S)"
mkdir -p "$BASE/releases/$TS"
git -C "$SRC" archive "origin/$BRANCH" | tar -x -C "$BASE/releases/$TS"
ln -sfn "releases/$TS" "$BASE/current"

# Keep the newest three. The names are UTC timestamps, so sorting the names
# sorts the releases.
( cd "$BASE/releases" && ls -1 | sort -r | tail -n +4 | xargs -r rm -rf ) || true

echo "$NEW" > "$STAMP"
echo "deployed release $TS from $NEW"
