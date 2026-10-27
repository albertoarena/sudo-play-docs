import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { release, releaseNote } from '../src/data/release';

// The app's release state lives in one file, so the first release changes
// every page by editing src/data/release.ts and nothing else.
const source = 'src';
const home = join('dist', 'index.html');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  });
}

describe('releaseNote', () => {
  it('says there is no release when there is none', () => {
    expect(releaseNote(null)).toMatch(/no release yet/i);
  });

  it('names the release once there is one', () => {
    const note = releaseNote({
      version: '1.0.0',
      name: '1.0.0',
      date: '2026-11-02',
      url: 'https://github.com/albertoarena/sudo-play/releases/tag/v1.0.0',
      dmg: { file: 'Sudo-Play-1.0.0-arm64.dmg', url: 'https://example.com/x.dmg', size: '167 MB', sha256: 'a'.repeat(64) },
    });

    expect(note).toBe('The current release is 1.0.0.');
  });
});

// 1.0.3, published on 2026-10-27. The app starts its background PHP
// process again when it stops, and keeps a second log file.
it('is the signed 1.0.3', () => {
  const tag = 'https://github.com/albertoarena/sudo-play/releases';

  expect(release).toEqual({
    version: '1.0.3',
    name: '1.0.3',
    date: '2026-10-27',
    url: `${tag}/tag/v1.0.3`,
    dmg: {
      file: 'Sudo-Play-1.0.3-arm64.dmg',
      url: `${tag}/download/v1.0.3/Sudo-Play-1.0.3-arm64.dmg`,
      size: '163 MB',
      sha256: '43ad8b4b56c47856fa266b807e114efcbbbca26955e964608a1e78ddee46d479',
    },
  });
  expect(releaseNote(release)).toBe('The current release is 1.0.3.');
});

it('Home states the release from the data file', () => {
  const html = existsSync(home) ? readFileSync(home, 'utf8') : '';

  expect(html).toContain(releaseNote(release));
});

// A page that writes "no release" by hand would be missed when the first
// release ships.
it('says "no release" nowhere but the data file', () => {
  const offenders = sourceFiles(source)
    .filter((file) => file !== join(source, 'data', 'release.ts'))
    .filter((file) => /no release/i.test(readFileSync(file, 'utf8')));

  expect(offenders, 'Use releaseNote() from src/data/release.ts instead').toEqual([]);
});
