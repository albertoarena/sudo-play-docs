import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Phase 3 checks on the built copy. Like dist.test.ts, these read dist/, so
// `npm test` needs a `npm run build` before it.
const dist = 'dist';
const app = 'https://github.com/albertoarena/sudo-play';

// Pages whose copy is written. A page joins this list when phase 3 replaces
// its placeholder, and the list ends as every page.
const finished = ['index.html', 'privacy/index.html'];

function read(file: string): string {
  const path = join(dist, file);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

// The page's own content, without the masthead, footer and previous and next.
function column(html: string): string {
  return html.match(/<div class="column"[^>]*>([\s\S]*?)<\/div>\s*<nav[^>]*aria-label="Previous and next"/)?.[1] ?? '';
}

function links(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((match) => match[1]);
}

describe.each(finished)('%s', (file) => {
  const html = read(file);

  it('carries no placeholder text', () => {
    expect(html).not.toBe('');
    expect(html).not.toContain('data-placeholder');
    expect(html).not.toMatch(/placeholder/i);
  });

  // AGENTS.md: plain English, no em dashes and no en dashes.
  it('has no em dash and no en dash', () => {
    expect(column(html)).not.toBe('');
    expect(column(html)).not.toMatch(/[–—]|&[mn]dash;/);
  });
});

describe('Home', () => {
  const content = column(read('index.html'));

  it('points to the pages that follow', () => {
    expect(links(content)).toEqual(expect.arrayContaining(['/how-it-works/', '/install/', '/moods/']));
  });

  // The app's promise is about the app. Any copy that states it names the app.
  it('names Sudo Play when it states the app promise', () => {
    const sentence = content.match(/[^.>]*no analytics[^.<]*/i)?.[0] ?? '';

    expect(sentence).toMatch(/Sudo Play|The app/);
  });
});

describe('Privacy', () => {
  const content = column(read('privacy/index.html'));

  // Link, do not copy: the app's policy lives in the app repository.
  it('links to the app privacy policy', () => {
    expect(links(content)).toContain(`${app}/blob/main/PRIVACY.md`);
  });

  it('says what this site loads and what it does not', () => {
    expect(content).toMatch(/cookie/i);
    expect(content).toMatch(/font/i);
    expect(content).toMatch(/third part/i);
  });
});
