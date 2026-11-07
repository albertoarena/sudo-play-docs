// Compares src/data/catalog.ts with the catalog the shipped app downloads,
// catalog/playlists.yaml on the app's catalog-live branch. A catalog change
// reaches users without a release, so run it by hand after each one, and at
// each release:
//
//   npm run check:catalog
//
// It downloads the file, so CI does not run it: a mood merged in the app would
// fail every docs pull request until the site caught up. The tests beside the
// site cover parseCatalog and compareCatalog with small fixtures.
//
// The catalog's genres, moods and playlists are lists of flat maps of
// strings, plus a playlist's moods as a flow list like [debugging, flow-state].
// This reads that shape alone and adds no YAML dependency. Any other line
// inside those three lists is an error, so a new YAML form stops the check
// instead of passing it.
import { pathToFileURL } from 'node:url';
import { genres, moods, playlists, type Genre, type Mood, type Playlist } from '../src/data/catalog.ts';

// The same URL as DEFAULT_CATALOG_URL in the app's app/Settings/SettingKey.php.
export const catalogUrl = 'https://raw.githubusercontent.com/albertoarena/sudo-play/catalog-live/catalog/playlists.yaml';

export interface Catalog {
  genres: readonly Genre[];
  moods: readonly Mood[];
  playlists: readonly Playlist[];
}

type Entry = Record<string, string | string[]>;
const listNames = ['genres', 'moods', 'playlists'];

export function parseCatalog(yaml: string): Catalog {
  const lists: Record<string, Entry[]> = {};
  let current: Entry[] | null = null;
  let name = '';

  yaml.split('\n').forEach((raw, index) => {
    const line = stripComment(raw).trimEnd();
    if (line === '') return;
    const fail = () => {
      throw new Error(`line ${index + 1}: cannot read "${raw.trim()}"`);
    };

    const top = line.match(/^([A-Za-z_]+):(.*)$/);
    if (top) {
      const [, key, rest] = top;
      name = key;
      current = listNames.includes(key) ? (lists[key] = []) : null;
      if (current && rest.trim() !== '') fail();
      return;
    }
    if (!current) return;

    const field = line.match(/^ {2}(- | {2})([a-z_]+): (.+)$/);
    if (!field) return fail();
    const [, marker, key, value] = field;
    if (marker === '- ') current.push({});
    const entry = current.at(-1);
    if (!entry) return fail();
    if (name === 'playlists' && key === 'moods') entry[key] = flowList(value) ?? fail();
    else entry[key] = scalar(value) ?? fail();
  });

  return {
    genres: required(lists.genres, 'genres', ['id', 'label']).map(({ id, label }) => ({ id, label }) as Genre),
    moods: required(lists.moods, 'moods', ['id', 'label', 'emoji', 'description']).map(
      ({ id, label, emoji, description }) => ({ id, label, emoji, description }) as Mood,
    ),
    playlists: required(lists.playlists, 'playlists', ['id', 'title', 'url', 'genre', 'moods']).map(
      ({ id, title, url, genre, moods }) => ({ id, title, url, genre, moods }) as Playlist,
    ),
  };
}

export function compareCatalog(here: Catalog, app: Catalog): string[] {
  return [
    ...compareList('genre', here.genres, app.genres),
    ...compareList('mood', here.moods, app.moods),
    ...compareList('playlist', here.playlists, app.playlists),
  ];
}

function compareList(kind: string, here: readonly (Genre | Mood | Playlist)[], app: readonly (Genre | Mood | Playlist)[]): string[] {
  const differences: string[] = [];
  const hereIds = here.map((entry) => entry.id);
  const appIds = app.map((entry) => entry.id);

  for (const id of appIds.filter((id) => !hereIds.includes(id))) differences.push(`${kind} ${id} is in the app but not here`);
  for (const id of hereIds.filter((id) => !appIds.includes(id))) differences.push(`${kind} ${id} is here but not in the app`);

  for (const ours of here) {
    const theirs = app.find((entry) => entry.id === ours.id);
    if (!theirs) continue;
    for (const [key, value] of Object.entries(ours)) {
      const mine = text(value);
      const other = text((theirs as unknown as Entry)[key]);
      if (mine !== other) differences.push(`${kind} ${ours.id}: ${key} is "${mine}" here and "${other}" in the app`);
    }
  }

  const sharedHere = hereIds.filter((id) => appIds.includes(id));
  const sharedApp = appIds.filter((id) => hereIds.includes(id));
  if (sharedHere.join() !== sharedApp.join()) {
    differences.push(`${kind}s are in a different order: here ${sharedHere.join(', ')}; in the app ${sharedApp.join(', ')}`);
  }

  return differences;
}

function text(value: string | readonly string[] | undefined): string | undefined {
  return Array.isArray(value) ? value.join(', ') : (value as string | undefined);
}

// Drops a # comment, but not a # inside quotes.
function stripComment(line: string): string {
  let quote = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '#' && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i);
    }
  }
  return line;
}

// A plain, single quoted or double quoted string. Anything else is undefined.
function scalar(value: string): string | undefined {
  if (/^".*"$/.test(value)) return JSON.parse(value) as string;
  if (/^'.*'$/.test(value)) return value.slice(1, -1).replaceAll("''", "'");
  if (/^[>|[{&*!%@`"']/.test(value)) return undefined;
  return value;
}

// A flow list of plain strings, [a, b]. Anything else is undefined.
function flowList(value: string): string[] | undefined {
  const inner = value.match(/^\[(.*)\]$/)?.[1];
  if (inner === undefined || inner.trim() === '') return undefined;
  const items = inner.split(',').map((item) => scalar(item.trim()));
  return items.every((item): item is string => item !== undefined && item !== '') ? items : undefined;
}

function required(list: Entry[] | undefined, name: string, keys: string[]): Entry[] {
  if (!list || list.length === 0) throw new Error(`the catalog has no ${name}`);
  for (const entry of list) {
    const missing = keys.filter((key) => !(key in entry));
    if (missing.length) throw new Error(`${name}: ${entry.id ?? 'an entry'} has no ${missing.join(', ')}`);
  }
  return list;
}

async function main(): Promise<void> {
  const response = await fetch(catalogUrl);
  if (!response.ok) throw new Error(`${catalogUrl}: HTTP ${response.status}`);
  const differences = compareCatalog({ genres, moods, playlists }, parseCatalog(await response.text()));

  if (differences.length) {
    console.error('src/data/catalog.ts differs from the catalog on catalog-live:');
    for (const difference of differences) console.error(`- ${difference}`);
    process.exit(1);
  }
  console.log(
    `src/data/catalog.ts matches the catalog on catalog-live: ${genres.length} genres, ${moods.length} moods, ${playlists.length} playlists.`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
