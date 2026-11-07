// The groups on Playlists, decided 2026-11-07. Each cover takes its colour from
// the playlist's first mood, the one in its id, and the colours pair the app's
// moods like this. The page heads each group with the app's own mood names, in
// the catalog's order, and orders a group by genre, as the catalog orders
// genres. A new mood in the catalog needs a place here: tests/shelf.test.ts
// fails until it has one.
import { genres, moods, playlists as all, type Playlist } from './catalog';

export const moodGroups: readonly (readonly string[])[] = [
  ['shipped-it', 'friday-deploy'],
  ['coffee-needed', 'blue-monday'],
  ['flow-state', 'debugging'],
  ['agent-mode'],
  ['night-shift'],
];

export interface ShelfGroup {
  heading: string;
  moods: readonly string[];
  playlists: readonly Playlist[];
}

export function shelf(playlists: readonly Playlist[] = all): ShelfGroup[] {
  for (const playlist of playlists) {
    if (!moodGroups.some((group) => group.includes(playlist.moods[0]))) {
      throw new Error(`${playlist.id}: its first mood, ${playlist.moods[0]}, is in no group in src/data/shelf.ts`);
    }
  }
  const label = (id: string) => moods.find((mood) => mood.id === id)?.label ?? id;
  const genreIndex = (playlist: Playlist) => genres.findIndex((genre) => genre.id === playlist.genre);

  return moodGroups.map((group) => ({
    heading: group.map(label).join(' and '),
    moods: group,
    playlists: playlists.filter((playlist) => group.includes(playlist.moods[0])).sort((a, b) => genreIndex(a) - genreIndex(b)),
  }));
}
