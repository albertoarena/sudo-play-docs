import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// Phase 4 checks on the built site. Like dist.test.ts, these read dist/, so
// `npm test` needs a `npm run build` before it.
const dist = 'dist';
const origin = 'https://sudoplay.dev';

function read(file: string): string {
  const path = join(dist, file);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [relative(dist, path)] : [];
  });
}

// Pages a search engine may index: every built page that does not ask not to
// be, which leaves out the 404.
const indexable = (existsSync(dist) ? htmlFiles(dist) : []).filter(
  (file) => !/<meta name="robots" content="noindex"/.test(read(file)),
);

function canonical(html: string): string {
  return html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? '';
}

describe('robots.txt', () => {
  const robots = read('robots.txt');

  // Search engines and AI answer engines are both welcome on every page.
  it('blocks no crawler from any page', () => {
    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).not.toMatch(/^Disallow:\s*\S/m);
  });

  it('points to the sitemap on the canonical host', () => {
    expect(robots).toMatch(new RegExp(`^Sitemap: ${origin}/sitemap\\.xml$`, 'm'));
  });
});

describe('sitemap.xml', () => {
  const sitemap = read('sitemap.xml');
  const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(([, loc]) => loc);

  it('is a sitemap', () => {
    expect(sitemap).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  // Built from the same page list as the nav, and checked against the pages
  // that were actually built, so neither can drift from the other.
  it('lists the canonical of every indexable page, once each', () => {
    expect(indexable.length).toBeGreaterThan(0);
    expect([...locs].sort()).toEqual(indexable.map((file) => canonical(read(file))).sort());
  });

  it('lists only pages on the canonical host', () => {
    for (const loc of locs) expect(new URL(loc).origin).toBe(origin);
  });
});
