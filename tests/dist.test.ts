import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// These checks read the built site. `npm run check` builds it first; on its
// own, `npm test` needs a `npm run build` before it.
const dist = 'dist';
const origin = 'https://sudoplay.dev';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

function canonicals(html: string): string[] {
  return (html.match(/<link\b[^>]*>/gi) ?? [])
    .filter((tag) => /\brel=["']?canonical["'\s>]/i.test(tag))
    .map((tag) => tag.match(/\bhref=["']([^"']*)["']/i)?.[1] ?? '');
}

it('builds the home page', () => {
  expect(existsSync(join(dist, 'index.html'))).toBe(true);
});

describe.each(existsSync(dist) ? htmlFiles(dist) : [])('%s', (file) => {
  const html = readFileSync(file, 'utf8');

  it('has a non empty title', () => {
    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '';

    expect(title.trim()).not.toBe('');
  });

  // The 404 is the one page without a canonical: it is served for any
  // address that does not exist, and asks not to be indexed.
  if (file === join(dist, '404.html')) {
    it('has no canonical', () => {
      expect(canonicals(html)).toEqual([]);
    });
    return;
  }

  it(`has one canonical on ${origin}`, () => {
    const found = canonicals(html);

    expect(found).toHaveLength(1);
    // .dev is HSTS preloaded: no http, no www, no port.
    expect(new URL(found[0]).origin).toBe(origin);
  });
});
