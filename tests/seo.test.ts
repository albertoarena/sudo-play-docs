import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Phase 4 checks on the built site. Like dist.test.ts, these read dist/, so
// `npm test` needs a `npm run build` before it.
const dist = 'dist';
const origin = 'https://sudoplay.dev';

function read(file: string): string {
  const path = join(dist, file);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
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
