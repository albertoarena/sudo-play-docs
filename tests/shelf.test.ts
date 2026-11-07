import { expect, it } from 'vitest';
import { genres, moods, playlists } from '../src/data/catalog';
import { moodGroups, shelf } from '../src/data/shelf';

// The groups on Playlists, decided 2026-11-07: a pair of the app's moods per
// cover colour, so the page shows only the app's names.
it('puts every mood in the catalog in exactly one group', () => {
  const grouped = moodGroups.flat();

  expect([...grouped].sort()).toEqual(moods.map((mood) => mood.id).sort());
});

it('orders the groups as the catalog orders their first mood', () => {
  const firsts = moodGroups.map((group) => Math.min(...group.map((id) => moods.findIndex((mood) => mood.id === id))));

  expect(firsts).toEqual([...firsts].sort((a, b) => a - b));
});

it('heads each group with its moods, in catalog order', () => {
  expect(shelf().map((group) => group.heading)).toEqual([
    'Shipped It and Friday Deploy',
    'Coffee Needed and Blue Monday',
    'Flow State and Debugging',
    'Agent Mode',
    'Night Shift',
  ]);
});

it('shelves every playlist once, by its first mood', () => {
  const groups = shelf();

  expect(groups.flatMap((group) => group.playlists).map((playlist) => playlist.id).sort()).toEqual(
    playlists.map((playlist) => playlist.id).sort(),
  );
  for (const group of groups) {
    for (const playlist of group.playlists) expect(group.moods, playlist.id).toContain(playlist.moods[0]);
  }
});

it('orders a group by genre, as the catalog orders genres', () => {
  for (const group of shelf()) {
    const order = group.playlists.map((playlist) => genres.findIndex((genre) => genre.id === playlist.genre));

    expect(order, group.heading).toEqual([...order].sort((a, b) => a - b));
  }
});

it('refuses a playlist whose first mood is in no group', () => {
  expect(() => shelf([{ ...playlists[0], moods: ['no-such-mood'] }])).toThrow(/no-such-mood/);
});
