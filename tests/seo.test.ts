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

function decode(text: string): string {
  return text
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// The content of a meta tag, by name or by property.
function meta(html: string, key: string): string[] {
  return (html.match(/<meta\b[^>]*>/g) ?? [])
    .filter((tag) => tag.includes(`name="${key}"`) || tag.includes(`property="${key}"`))
    .map((tag) => decode(tag.match(/\bcontent="([^"]*)"/)?.[1] ?? ''));
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

describe('404.html', () => {
  const html = read('404.html');

  it('is built', () => {
    expect(html).not.toBe('');
  });

  // A 404 is not a page to index, and has no address of its own to call
  // canonical: the server sends it for any address that does not exist.
  it('asks not to be indexed and has no canonical', () => {
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(canonical(html)).toBe('');
  });

  it('says the page was not found and links home', () => {
    expect(html).toMatch(/<h1>Page not found<\/h1>/);
    expect(html).toMatch(/<a\b[^>]*href="\/"/);
  });
});

describe.each(indexable)('%s', (file) => {
  const html = read(file);
  const [description] = meta(html, 'description');
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');

  // Search results cut a description at about 160 characters.
  it('has one description, short enough to show in full', () => {
    expect(meta(html, 'description')).toHaveLength(1);
    expect(description.trim()).not.toBe('');
    expect(description.length).toBeLessThanOrEqual(160);
  });

  // AGENTS.md: plain English, no em dashes and no en dashes.
  it('has no em dash and no en dash in its description', () => {
    expect(description).not.toMatch(/[–—]/);
  });

  // .dev is HSTS preloaded, so og:url is https://sudoplay.dev like the
  // canonical, and the same address.
  it('describes itself to a link preview', () => {
    expect(meta(html, 'og:type')).toEqual(['website']);
    expect(meta(html, 'og:site_name')).toEqual(['Sudo Play']);
    expect(meta(html, 'og:title')).toEqual([title]);
    expect(meta(html, 'og:description')).toEqual([description]);
    expect(meta(html, 'og:url')).toEqual([canonical(html)]);
  });
});

it('gives every indexable page its own description', () => {
  const descriptions = indexable.map((file) => meta(read(file), 'description')[0]);

  expect(new Set(descriptions).size).toBe(indexable.length);
});
