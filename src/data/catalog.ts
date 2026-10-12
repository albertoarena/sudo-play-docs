// The genres and moods from the app's catalog/playlists.yaml at checkedAt in
// src/data/release.ts, copied word for word and in the catalog's order.
// Playlists are not copied: they rotate daily and belong to the app.
// `npm run check:catalog` compares this file with a local sudo-play checkout.
export interface Genre {
  id: string;
  label: string;
}

export interface Mood {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export const genres: readonly Genre[] = [
  { id: 'classical', label: 'Classical' },
  { id: 'rock', label: 'Rock' },
  { id: 'pop', label: 'Pop' },
  { id: 'indie', label: 'Indie' },
  { id: 'electronic', label: 'Electronic' },
  { id: 'jazz', label: 'Jazz' },
  { id: 'lofi', label: 'Lo-fi' },
];

export const moods: readonly Mood[] = [
  { id: 'shipped-it', label: 'Shipped It', emoji: '🎉', description: 'Happy, something just went live.' },
  { id: 'coffee-needed', label: 'Coffee Needed', emoji: '☕', description: 'Tired, slow start.' },
  { id: 'blue-monday', label: 'Blue Monday', emoji: '😔', description: 'Low energy, start of the week.' },
  { id: 'flow-state', label: 'Flow State', emoji: '🎧', description: 'Deep focus, no distractions.' },
  { id: 'debugging', label: 'Debugging', emoji: '🐛', description: 'Calm and patient, a long investigation.' },
  { id: 'friday-deploy', label: 'Friday Deploy', emoji: '🚀', description: 'Brave, energetic, a bit risky.' },
];
