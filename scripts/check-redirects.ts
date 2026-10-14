// Checks the live redirects, status codes and 404 page. Run it by hand after
// every deploy change and after any edit to the docroot .htaccess:
//
//   npm run check:redirects                         # https://sudoplay.dev
//   npm run check:redirects -- http://localhost:8099
//
// tests/deploy.test.ts reads the .htaccess files as text, so it proves a rule
// is there and never that Apache runs it. On another site of the same host, a
// redirect sat below the docroot's catch-all rule for days without firing, and
// mod_dir sent every address without a trailing slash through a visible
// /current/ address. Both passed every text check. This script asks the server.
//
// Against any base but https://sudoplay.dev it skips the host and scheme cases,
// which only the live DNS and certificate can answer, and follows a redirect
// to the base's own host over the base's scheme, so a local Apache over http
// can run the rest. Exits non zero if any case fails.

import { argv, exit, pid } from 'node:process';

const live = 'https://sudoplay.dev';
const base = (argv[2] ?? live).replace(/\/$/, '');
const isLive = base === live;
const baseUrl = new URL(base);

// A fixed query on every request, so a cached answer on the host cannot pass
// for a fresh one. Fixed per run, so a failure can be fetched again by hand.
const nonce = `nc=${pid}`;

interface Case {
  path?: string;
  url?: string;
  hops: number;
  status: number;
  endsAt?: string;
  body?: string;
}

const CASES: Case[] = [
  // Already canonical: no redirect, and no second slash on the root.
  { path: '/', hops: 0, status: 200, endsAt: `${base}/` },
  { path: '/moods/', hops: 0, status: 200, endsAt: `${base}/moods/` },
  { path: '/favicon.svg', hops: 0, status: 200, endsAt: `${base}/favicon.svg` },

  // No trailing slash: one hop, straight to the real address.
  { path: '/moods', hops: 1, status: 200, endsAt: `${base}/moods/` },
  { path: '/how-it-works', hops: 1, status: 200, endsAt: `${base}/how-it-works/` },
  { path: '/moods?from=test', hops: 1, status: 200, endsAt: `${base}/moods/?from=test` },

  // One page, one address.
  { path: '/index.html', hops: 1, status: 200, endsAt: `${base}/` },
  { path: '/moods/index.html', hops: 1, status: 200, endsAt: `${base}/moods/` },

  // The deploy plumbing, asked for directly.
  { path: '/current/moods/', hops: 1, status: 200, endsAt: `${base}/moods/` },
  { path: '/current/moods', hops: 2, status: 200, endsAt: `${base}/moods/` },
  { path: '/releases/', hops: 0, status: 403 },

  // An unknown address gets the site's own 404 page, with a 404 status.
  { path: '/no-such-page/', hops: 0, status: 404, body: 'Page not found' },
];

// Only the live host has the certificate and the www record. Two hops is the
// floor for www with no trailing slash: the host rule and the slash rule live
// in different files, by necessity.
const LIVE_CASES: Case[] = [
  { url: 'http://sudoplay.dev/', hops: 1, status: 200, endsAt: `${live}/` },
  { url: 'https://www.sudoplay.dev/', hops: 1, status: 200, endsAt: `${live}/` },
  { url: 'http://www.sudoplay.dev/moods/', hops: 1, status: 200, endsAt: `${live}/moods/` },
  { url: 'http://www.sudoplay.dev/moods', hops: 2, status: 200, endsAt: `${live}/moods/` },
];

const withNonce = (url: string) => url + (url.includes('?') ? '&' : '?') + nonce;
const stripNonce = (url: string) => url.replace(new RegExp(`[?&]${nonce}$`), '');

// Off the live host, a redirect to the base's host keeps the base's scheme.
function follow(location: string, from: string): string {
  const next = new URL(location, from);
  if (!isLive && next.host === baseUrl.host) next.protocol = baseUrl.protocol;
  return next.toString();
}

async function chase(start: string) {
  const locations: string[] = [];
  let url = withNonce(start);
  let response = await fetch(url, { redirect: 'manual' });

  while (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (!location) break;
    locations.push(new URL(location, url).toString());
    if (locations.length > 10) throw new Error('more than 10 redirects');
    url = follow(location, url);
    response = await fetch(url, { redirect: 'manual' });
  }

  return { locations, status: response.status, finalUrl: stripNonce(url), body: await response.text() };
}

function problems(expected: Case, actual: Awaited<ReturnType<typeof chase>>): string[] {
  const found: string[] = [];
  for (const location of actual.locations) {
    if (/\/(current|releases)(\/|$|\?)/.test(location)) found.push(`shows the deploy path: ${stripNonce(location)}`);
  }
  if (actual.locations.length !== expected.hops) found.push(`${actual.locations.length} hops, expected ${expected.hops}`);
  if (actual.status !== expected.status) found.push(`status ${actual.status}, expected ${expected.status}`);
  if (expected.endsAt && actual.finalUrl !== expected.endsAt) found.push(`ended at ${actual.finalUrl}, expected ${expected.endsAt}`);
  if (expected.body && !actual.body.includes(expected.body)) found.push(`body does not contain "${expected.body}"`);
  if (/\/\/$/.test(actual.finalUrl.replace(/^https?:\/\//, ''))) found.push(`double slash: ${actual.finalUrl}`);
  return found;
}

const cases = isLive ? [...CASES, ...LIVE_CASES] : CASES;
let failures = 0;

for (const expected of cases) {
  const target = expected.url ?? `${base}${expected.path}`;
  try {
    const actual = await chase(target);
    const found = problems(expected, actual);
    if (found.length === 0) {
      console.log(`ok    ${target}${actual.locations.length ? ` (${actual.locations.length} hop${actual.locations.length > 1 ? 's' : ''})` : ''}`);
      continue;
    }
    failures++;
    console.log(`FAIL  ${target}`);
    for (const problem of found) console.log(`        ${problem}`);
    for (const location of actual.locations) console.log(`        via ${stripNonce(location)}`);
  } catch (error) {
    failures++;
    console.log(`FAIL  ${target}\n        ${(error as Error).message}`);
  }
}

// docs/PLAN.md: DNS stays DNS only. A proxied record would let Cloudflare add
// its beacon to every page, a third party request before consent that no local
// test can see. Every page in the sitemap must be free of it.
if (isLive) {
  const sitemap = await (await fetch(withNonce(`${live}/sitemap.xml`))).text();
  for (const [, page] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const html = await (await fetch(withNonce(page))).text();
    if (html.includes('cloudflareinsights')) {
      failures++;
      console.log(`FAIL  ${page}\n        carries the Cloudflare beacon`);
    } else {
      console.log(`ok    ${page} (no Cloudflare beacon)`);
    }
  }
}

console.log(failures === 0 ? `\nEvery check passed against ${base}.` : `\n${failures} failed against ${base}. Roll back before walking away.`);
exit(failures === 0 ? 0 : 1);
