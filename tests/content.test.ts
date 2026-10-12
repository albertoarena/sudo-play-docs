import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { moods } from '../src/data/catalog';
import { release, releaseNote } from '../src/data/release';

// Phase 3 checks on the built copy. Like dist.test.ts, these read dist/, so
// `npm test` needs a `npm run build` before it.
const dist = 'dist';
const app = 'https://github.com/albertoarena/sudo-play';

// Pages whose copy is written. A page joins this list when phase 3 replaces
// its placeholder, and the list ends as every page.
const finished = ['index.html', 'how-it-works/index.html', 'install/index.html', 'moods/index.html', 'privacy/index.html', 'tips/index.html'];

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

// The guard the finished list cannot give: a page left off the list would
// ship its placeholder. This one finds every page itself, so it stays red
// until phase 3 has written all of them.
it('ships no page with placeholder text', () => {
  const pages = existsSync(dist) ? htmlFiles(dist) : [];
  const unfinished = pages.filter((file) => readFileSync(file, 'utf8').includes('data-placeholder'));

  expect(pages).not.toHaveLength(0);
  expect(unfinished, 'These pages still carry the placeholder marker').toEqual([]);
});

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

  // The site will run GA4 behind the consent gate, so Privacy says so from the
  // first day it is live, and never that the site has no analytics.
  it('says Google Analytics loads only after the visitor accepts', () => {
    expect(content).toMatch(/Google Analytics/);
    expect(content).toMatch(/accept/i);
    expect(content).not.toMatch(/no analytics/i);
  });
});

describe('Moods', () => {
  const content = column(read('moods/index.html'));

  it('lists every mood from the catalog, in catalog order', () => {
    const positions = moods.map((mood) => content.indexOf(mood.label));

    expect(positions.every((position) => position !== -1)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    for (const mood of moods) expect(content).toContain(mood.description);
  });

  // The label already says what the mood is, so a screen reader skips the
  // emoji, as it does in the app.
  it('shows each emoji once, hidden from screen readers', () => {
    for (const mood of moods) {
      expect(content.split(mood.emoji), mood.id).toHaveLength(2);
      expect(content).toMatch(new RegExp(`<[^>]*aria-hidden="true"[^>]*>${mood.emoji}<`));
    }
  });

  // The catalog's text mixes feelings and moments, and reads naturally after
  // "Feels like". Decided 2026-10-12.
  it('heads the description column "Feels like"', () => {
    expect(content).toMatch(/<th scope="col">Feels like<\/th>/);
  });

  it('says the moods come from the app catalog', () => {
    expect(content).toMatch(/catalog/i);
  });

  // Link, do not copy: adding a playlist is documented in the app's README.
  it('links to the README section on adding a playlist', () => {
    expect(links(content)).toContain(`${app}/blob/main/README.md#adding-a-playlist`);
  });
});

describe('How it works', () => {
  const content = column(read('how-it-works/index.html'));
  const table = content.match(/<table[\s\S]*?<\/table>/)?.[0] ?? '';

  it('says the pick is the same all day and changes tomorrow', () => {
    expect(content).toMatch(/same all day/i);
    expect(content).toMatch(/tomorrow/i);
  });

  it('says what Play does, including when Spotify is closed', () => {
    expect(content).toMatch(/Spotify is closed/);
    expect(content).toMatch(/open only/);
    expect(content).toMatch(/web player/);
  });

  it('names Next and Surprise me', () => {
    expect(content).toMatch(/Next/);
    expect(content).toMatch(/Surprise me/);
    expect(content).not.toMatch(/placeholder/i);
  });

  it('lists every key in a table', () => {
    for (const key of ['Enter', 'N', 'S', 'Esc', 'Tab']) expect(table).toContain(`<kbd>${key}</kbd>`);
    expect(table).toMatch(/arrow keys/i);
  });

  // The app's code at checkedAt falls back to autoplay when nothing is chosen,
  // which is why the permission prompt appears without a visit to Settings.
  it('says autoplay is the default player mode', () => {
    expect(content).toMatch(/autoplay[^.]*default|default[^.]*autoplay/i);
  });

  it('mentions the optional daily reminder', () => {
    expect(content).toMatch(/daily reminder/i);
  });

  // PRIVACY.md describes the permission; this page links to it.
  it('explains the Automation permission and links to the app privacy policy', () => {
    expect(content).toMatch(/Automation/);
    expect(content).toMatch(/System Settings/);
    expect(links(content)).toContain(`${app}/blob/main/PRIVACY.md`);
  });

  // Moods has the table, and the README explains adding a playlist.
  it('points to Moods and the README instead of copying them', () => {
    expect(links(content)).toContain('/moods/');
    expect(links(content)).toContain(`${app}/blob/main/README.md#adding-a-playlist`);
    expect(content).not.toContain('catalog/playlists.yaml');
    for (const mood of moods) expect(content).not.toContain(mood.description);
  });
});

describe('Install', () => {
  const content = column(read('install/index.html'));

  it('states the release from the data file', () => {
    expect(content).toContain(releaseNote(release));
  });

  // The app's README: the first release is a signed DMG on a GitHub Release.
  it('says what the first release will be, and links to the releases page', () => {
    expect(content).toMatch(/signed DMG/);
    expect(content).toMatch(/GitHub Release/);
    expect(links(content)).toContain(`${app}/releases`);
  });

  // Building from source is for contributors, and CONTRIBUTING.md explains it.
  it('links to the app contributing guide for building from source', () => {
    expect(content).toMatch(/source/i);
    expect(links(content)).toContain(`${app}/blob/main/CONTRIBUTING.md#changing-the-code`);
  });

  // A warning box is design work for Impeccable, not for this page's copy.
  it('has no note or warning box', () => {
    expect(content).not.toContain('class="note"');
    expect(content).not.toMatch(/role="(note|alert)"/);
  });
});

describe('Tips', () => {
  const content = column(read('tips/index.html'));

  // Drafted from the app's README, PRIVACY.md and code at checkedAt, and
  // approved by Alberto on 2026-10-12.
  it('gives the tips the app sources support', () => {
    expect(content).toMatch(/same playlist/i);
    expect(content).toMatch(/launch at login/i);
    expect(content).toMatch(/daily reminder/i);
    expect(content).toMatch(/default genre and mood/i);
    expect(content).toMatch(/web player/i);
    expect(content).toMatch(/catalog URL/i);
    expect(content).toMatch(/within a day/i);
  });

  it('points to How it works and the README instead of copying them', () => {
    expect(links(content)).toContain('/how-it-works/');
    expect(links(content)).toContain(`${app}/blob/main/README.md#adding-a-playlist`);
  });
});
