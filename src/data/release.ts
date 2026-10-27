// The app release this site documents. Every page that mentions the release
// reads it from here, so the first release is one edit to this file, plus the
// Install steps, which a person checks against the real build.
export interface Release {
  version: string;
  // The version as a reader says it: "1.0.0".
  name: string;
  date: string;
  url: string;
  dmg: { file: string; url: string; size: string; sha256: string };
}

const releases = 'https://github.com/albertoarena/sudo-play/releases';

// 1.0.3, published on 2026-10-27. The app starts its background PHP process
// again when it stops, and keeps a second log file, electron.log.
export const release: Release | null = {
  version: '1.0.3',
  name: '1.0.3',
  date: '2026-10-27',
  url: `${releases}/tag/v1.0.3`,
  dmg: {
    file: 'Sudo-Play-1.0.3-arm64.dmg',
    url: `${releases}/download/v1.0.3/Sudo-Play-1.0.3-arm64.dmg`,
    size: '163 MB',
    sha256: '43ad8b4b56c47856fa266b807e114efcbbbca26955e964608a1e78ddee46d479',
  },
};

// The sudo-play commit the copy was last checked against. Without a release,
// this is what the pages describe.
export const checkedAt = 'fb3b38a';

export function releaseNote(current: Release | null = release): string {
  return current ? `The current release is ${current.name}.` : 'There is no release yet.';
}
