import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// A stored theme has to apply before the first paint, or a dark choice
// flashes white on every page. So every page reads it in its head.
function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith('.html') ? [path] : [];
  });
}

const pages = existsSync('dist') ? htmlFiles('dist') : [];

it('has built pages to check', () => {
  expect(pages.length).toBeGreaterThan(0);
});

describe.each(pages)('%s', (file) => {
  it('applies the stored theme in the head', () => {
    const head = readFileSync(file, 'utf8').match(/<head>[\s\S]*?<\/head>/)?.[0] ?? '';
    const script = head.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';

    expect(script).toContain('sudoplay-theme');
    expect(script).toContain('dataset.theme');
  });
});
