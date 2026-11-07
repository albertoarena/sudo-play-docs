import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { genres, moods, playlists } from '../src/data/catalog';

// The genres, moods and playlists are copied from the app's catalog/playlists.yaml at
// checkedAt. `npm run check:catalog` compares them with the app; these tests
// only keep the copy well formed.
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe.each([
  ['genres', genres],
  ['moods', moods],
  ['playlists', playlists],
] as const)('%s', (_name, entries) => {
  it('is not empty', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it('has unique lowercase ids', () => {
    const ids = entries.map((entry) => entry.id);

    expect(ids.every((id) => slug.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names every entry', () => {
    expect(entries.every((entry) => ('label' in entry ? entry.label : entry.title).trim() !== '')).toBe(true);
  });
});

it('gives every mood an emoji and a description', () => {
  for (const mood of moods) {
    expect(mood.emoji.trim(), mood.id).not.toBe('');
    expect(mood.description.trim(), mood.id).not.toBe('');
  }
});

describe('playlists', () => {
  const genreIds = genres.map((genre) => genre.id);
  const moodIds = moods.map((mood) => mood.id);

  it('gives every playlist a genre and moods from the catalog', () => {
    for (const playlist of playlists) {
      expect(genreIds, playlist.id).toContain(playlist.genre);
      expect(playlist.moods.length, playlist.id).toBeGreaterThan(0);
      for (const mood of playlist.moods) expect(moodIds, playlist.id).toContain(mood);
    }
  });

  it('links every playlist to its page on Spotify', () => {
    for (const playlist of playlists) {
      expect(playlist.url, playlist.id).toMatch(/^https:\/\/open\.spotify\.com\/playlist\/[A-Za-z0-9]{22}$/);
    }
  });

  // The covers come from spotify:cover in the curator's importer, renamed to
  // the catalog id and converted to WebP. Decided 2026-11-07.
  it('has one cover for every playlist, and no other', () => {
    const covers = readdirSync('public/covers').sort();

    expect(covers).toEqual(playlists.map((playlist) => `${playlist.id}.webp`).sort());
  });
});
