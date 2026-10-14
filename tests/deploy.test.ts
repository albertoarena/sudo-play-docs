import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

// Phase 6: CI publishes dist/ to a `deploy` branch, and a cron job on the host
// pulls it into releases/<timestamp>/ behind a `current` symlink. Read
// docs/DEPLOYMENT.md first.
//
// The .htaccess tests read the files as text. They prove a rule is there and
// never that Apache runs it: only `npm run check:redirects` against the live
// site can do that. The server script is different: it runs here for real,
// against a local repository.

function read(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

// Lines that Apache reads, without the comments.
function rules(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));
}

describe('the .htaccess in every release', () => {
  // Read from dist/, so it also fails if the build stops copying the dotfile:
  // then everything deploys green and /current/ serves the site twice.
  const htaccess = read('dist/.htaccess');
  const lines = rules(htaccess);

  it('ships in the build', () => {
    expect(htaccess, 'dist/.htaccess is missing: run npm run build').not.toBe('');
    expect(lines).toContain('RewriteEngine On');
  });

  // The relative form merges with the docroot's Options. An absolute one
  // replaces them and drops +FollowSymLinks, and the deploy is a symlink.
  it('turns directory listings off, in the relative form', () => {
    expect(lines).toContain('Options -Indexes');
    expect(lines.filter((line) => /^Options\s+(?![+-])/.test(line))).toEqual([]);
  });

  // THE_REQUEST is what the client asked for. The docroot's own rewrite into
  // current/ never changes it, so ordinary page views are not caught.
  it('sends /current/ and /releases/ addresses back to the real ones', () => {
    expect(htaccess).toMatch(/RewriteCond %\{THE_REQUEST\} \\s\/\+\(current\|releases\)\(\/\|\\\?\|\\s\) \[NC\]\nRewriteRule \^\(\.\*\)\$ https:\/\/%\{HTTP_HOST\}\/\$1 \[R=301,L\]/);
  });

  it('folds index.html into its directory', () => {
    expect(htaccess).toMatch(/RewriteCond %\{THE_REQUEST\} [^\n]*index\\\.html[^\n]*\nRewriteRule \^\(\.\*\/\)\?index\\\.html\$ https:\/\/%\{HTTP_HOST\}\/\$1 \[R=301,L\]/);
  });

  // Left to mod_dir, the slash redirect is built from the rewritten path, so
  // /moods would go through a visible /current/moods/.
  it('adds the trailing slash itself, keeping the query string', () => {
    expect(htaccess).toMatch(/RewriteCond %\{REQUEST_FILENAME\} -d\nRewriteRule \^\(\.\*\[\^\/\]\)\$ https:\/\/%\{HTTP_HOST\}\/\$1\/ \[R=301,L,QSA\]/);
  });

  // ErrorDocument resolves against the docroot, which has no 404.html.
  it('serves the 404 page through the current symlink', () => {
    expect(lines).toContain('ErrorDocument 404 /current/404.html');
  });

  // Host and scheme belong to the docroot file, which runs first. A preview
  // host must redirect to itself, so no rule here names the domain.
  it('never names the production host', () => {
    expect(lines.join('\n')).not.toContain('sudoplay.dev');
  });
});

describe('the docroot .htaccess, applied by hand', () => {
  const lines = rules(read('deploy/docroot.htaccess'));
  const at = (pattern: RegExp) => lines.findIndex((line) => pattern.test(line));
  const toCurrent = at(/^RewriteRule \^\(\.\*\)\$ current\/\$1 \[L\]$/);

  it('serves everything else from current/, as its last rule', () => {
    expect(toCurrent).toBeGreaterThan(-1);
    expect(lines[toCurrent - 1]).toBe('RewriteCond %{REQUEST_URI} !^/current/');
    expect(lines.slice(toCurrent + 1)).toEqual([]);
  });

  it('follows the symlink and lists no directory', () => {
    expect(lines).toContain('Options +FollowSymLinks -Indexes');
  });

  it('refuses the release directories', () => {
    const deny = at(/^RewriteRule \^releases\(\/\.\*\)\?\$ - \[F,L\]$/);
    expect(deny).toBeGreaterThan(-1);
    expect(deny).toBeLessThan(toCurrent);
  });

  // AutoSSL proves the domain with a file under /.well-known/. Rewritten into
  // current/ it would 404, and the certificate would not renew.
  it('leaves /.well-known/ to the host', () => {
    const wellKnown = at(/^RewriteRule \^\\\.well-known\/ - \[L\]$/);
    expect(wellKnown).toBeGreaterThan(-1);
    expect(wellKnown).toBeLessThan(at(/^RewriteCond %\{HTTPS\} off$/));
  });

  // A redirect below the rewrite into current/ never fires. The two rules
  // send http and www to https://sudoplay.dev, in one hop each.
  it('sends http and www to https://sudoplay.dev, above the rewrite', () => {
    const redirects = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line === 'RewriteRule ^(.*)$ https://sudoplay.dev/$1 [R=301,L]');

    expect(redirects).toHaveLength(2);
    for (const { index } of redirects) expect(index).toBeLessThan(toCurrent);
    expect(lines).toContain('RewriteCond %{HTTP_HOST} ^(www\\.)?sudoplay\\.dev$ [NC]');
    expect(lines).toContain('RewriteCond %{HTTP_HOST} ^www\\.sudoplay\\.dev$ [NC]');
  });
});

describe('the publish workflow', () => {
  const workflow = read('.github/workflows/publish.yml');

  // Publishing waits for CI, so a red main never reaches the host.
  it('publishes only after CI passes on a push to main', () => {
    expect(workflow).toMatch(/workflow_run:\n\s+workflows: \[CI\]\n\s+types: \[completed\]\n\s+branches: \[main\]/);
    expect(workflow).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(workflow).toContain("github.event.workflow_run.event == 'push'");
    expect(workflow).toContain('ref: ${{ github.event.workflow_run.head_sha }}');
  });

  // The ID is a repository variable, never in the code.
  it('builds with the measurement ID from the repository variable', () => {
    expect(workflow).toContain('PUBLIC_GA_MEASUREMENT_ID: ${{ vars.PUBLIC_GA_MEASUREMENT_ID }}');
    expect(workflow).not.toMatch(/G-[A-Z0-9]{6,}/);
  });

  it('force pushes dist/ to the deploy branch', () => {
    expect(workflow).toContain('cd dist');
    expect(workflow).toMatch(/git push -q --force "https:\/\/x-access-token:\$\{GITHUB_TOKEN\}@github\.com\/\$\{GITHUB_REPOSITORY\}\.git" deploy/);
  });
});

describe('the server deploy script', () => {
  const script = 'scripts/server-deploy.sh';
  const work = mkdtempSync(join(tmpdir(), 'sudoplay-deploy-'));
  const origin = join(work, 'origin');
  const base = join(work, 'site');
  const git = (cwd: string, ...args: string[]) =>
    execFileSync('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', ...args], { cwd, encoding: 'utf8' });
  const deploy = () =>
    execFileSync('bash', [script, base], { encoding: 'utf8', env: { ...process.env, DEPLOY_REPO: origin } });
  const releases = () => readdirSync(join(base, 'releases')).sort();
  const current = () => readFileSync(join(base, 'current', 'index.html'), 'utf8');

  // What CI pushes: one commit of built files on a `deploy` branch.
  function publish(page: string) {
    writeFileSync(join(origin, 'index.html'), page);
    git(origin, 'add', '-A');
    git(origin, 'commit', '-q', '-m', `build: ${page}`);
  }

  // Release folders are named to the second.
  const nextSecond = () => {
    const now = Math.floor(Date.now() / 1000);
    while (Math.floor(Date.now() / 1000) === now);
  };

  afterAll(() => rmSync(work, { recursive: true, force: true }));

  it('defaults to the sudoplay.dev docroot and this repository', () => {
    const text = read(script);
    expect(text).toContain('BASE="${1:-$HOME/sudoplay.dev}"');
    expect(text).toContain('REPO="${DEPLOY_REPO:-https://github.com/albertoarena/sudo-play-docs.git}"');
    expect(text).toContain('set -euo pipefail');
  });

  it('deploys, skips a deploy it has, and keeps the newest three releases', () => {
    git(work, 'init', '-q', '-b', 'deploy', origin);
    publish('one');

    expect(deploy()).toMatch(/^deployed release \d{14} from [0-9a-f]{40}$/m);
    expect(current()).toBe('one');
    expect(readlinkSync(join(base, 'current'))).toBe(`releases/${releases()[0]}`);
    expect(existsSync(join(base, 'current', '.git'))).toBe(false);

    expect(deploy()).toMatch(/^up to date/m);
    expect(releases()).toHaveLength(1);

    for (const page of ['two', 'three', 'four']) {
      nextSecond();
      publish(page);
      deploy();
    }

    expect(current()).toBe('four');
    expect(releases()).toHaveLength(3);
    expect(readlinkSync(join(base, 'current'))).toBe(`releases/${releases().at(-1)}`);
  }, 15_000);

  // CI force pushes, so the branch's history is rewritten every time.
  it('follows a force-pushed deploy branch', () => {
    nextSecond();
    git(origin, 'commit', '-q', '--amend', '-m', 'build: rewritten');
    deploy();

    expect(current()).toBe('four');
    expect(read(join(base, '.deployed-sha')).trim()).toBe(git(origin, 'rev-parse', 'HEAD').trim());
  }, 15_000);
});
