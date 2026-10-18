import { describe, expect, it } from 'vitest';
import { catalogUrl, compareCatalog, parseCatalog } from '../scripts/check-catalog';

// The comparison logic of `npm run check:catalog`, on small fixtures. The
// script itself downloads the app's catalog, so it runs by hand, not in CI.
const fixture = `# A comment
version: 1

genres:
  - id: rock
    label: Rock

  - id: lofi
    label: 'Lo-fi'   # a trailing comment

moods:
  - id: shipped-it
    label: Shipped It
    emoji: "🎉"
    description: Happy, something just went live.

  - id: friday-deploy
    label: "Friday Deploy"
    emoji: "🚀"
    description: Brave, energetic, a bit risky.

playlists:
  - id: rock-friday-deploy-01
    title: Riffs for risky releases
    genre: rock
    moods: [friday-deploy]
`;

const parsed = {
  genres: [
    { id: 'rock', label: 'Rock' },
    { id: 'lofi', label: 'Lo-fi' },
  ],
  moods: [
    { id: 'shipped-it', label: 'Shipped It', emoji: '🎉', description: 'Happy, something just went live.' },
    { id: 'friday-deploy', label: 'Friday Deploy', emoji: '🚀', description: 'Brave, energetic, a bit risky.' },
  ],
};

describe('parseCatalog', () => {
  it('reads genres and moods in order, and skips playlists', () => {
    expect(parseCatalog(fixture)).toEqual(parsed);
  });

  it('refuses a line it cannot read, instead of guessing', () => {
    const folded = fixture.replace('description: Happy, something just went live.', 'description: >\n      Happy.');

    expect(() => parseCatalog(folded)).toThrow(/line \d+/);
  });

  it('refuses a catalog without moods', () => {
    expect(() => parseCatalog('genres:\n  - id: rock\n    label: Rock\n')).toThrow(/moods/);
  });
});

describe('compareCatalog', () => {
  it('finds no difference in an identical copy', () => {
    expect(compareCatalog(parsed, parseCatalog(fixture))).toEqual([]);
  });

  it('names a changed field', () => {
    const app = parseCatalog(fixture.replace('a bit risky', 'very risky'));

    expect(compareCatalog(parsed, app)).toEqual([
      'mood friday-deploy: description is "Brave, energetic, a bit risky." here and "Brave, energetic, very risky." in the app',
    ]);
  });

  it('names an entry missing on either side', () => {
    const app = { ...parsed, genres: [...parsed.genres.slice(0, 1), { id: 'jazz', label: 'Jazz' }] };

    expect(compareCatalog(parsed, app)).toEqual(['genre jazz is in the app but not here', 'genre lofi is here but not in the app']);
  });

  it('notices a change of order', () => {
    const app = { ...parsed, moods: [...parsed.moods].reverse() };

    expect(compareCatalog(parsed, app)).toEqual([
      'moods are in a different order: here shipped-it, friday-deploy; in the app friday-deploy, shipped-it',
    ]);
  });
});

// The app downloads its catalog from catalog-live, so a new mood reaches users
// without a release. The site is checked against that same file. Decided
// 2026-10-18.
it('reads the catalog the shipped app downloads', () => {
  expect(catalogUrl).toBe('https://raw.githubusercontent.com/albertoarena/sudo-play/catalog-live/catalog/playlists.yaml');
});
