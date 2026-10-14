import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// AGENTS.md: no em dashes and no en dashes, anywhere we write. content.test.ts
// checks each page's column; this checks the whole page, so the title, the
// alt text, the masthead and the footer too, and every Markdown file we keep.
// Reads dist/, so `npm test` needs a `npm run build` before it.
const dash = /[–—]|&[mn]dash;|&#821[12];|&#x201[34];/i;
const dist = 'dist';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

describe('no em dash and no en dash', () => {
  it.each(existsSync(dist) ? htmlFiles(dist) : [])('in %s', (file) => {
    expect(readFileSync(file, 'utf8')).not.toMatch(dash);
  });

  const markdown = execFileSync('git', ['ls-files', '*.md'], { encoding: 'utf8' })
    .split('\n')
    .filter((file) => file !== '');

  it.each(markdown)('in %s', (file) => {
    expect(readFileSync(file, 'utf8')).not.toMatch(dash);
  });
});
