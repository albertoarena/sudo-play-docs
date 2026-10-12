import { describe, expect, it } from 'vitest';
import { genres, moods } from '../src/data/catalog';

// The genres and moods are copied from the app's catalog/playlists.yaml at
// checkedAt. `npm run check:catalog` compares them with the app; these tests
// only keep the copy well formed.
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe.each([
  ['genres', genres],
  ['moods', moods],
] as const)('%s', (_name, entries) => {
  it('is not empty', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it('has unique lowercase ids', () => {
    const ids = entries.map((entry) => entry.id);

    expect(ids.every((id) => slug.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a label on every entry', () => {
    expect(entries.every((entry) => entry.label.trim() !== '')).toBe(true);
  });
});

it('gives every mood an emoji and a description', () => {
  for (const mood of moods) {
    expect(mood.emoji.trim(), mood.id).not.toBe('');
    expect(mood.description.trim(), mood.id).not.toBe('');
  }
});
