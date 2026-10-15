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

// 1.0.2, published on 2026-10-15. It repackages 1.0.1: the app inside the DMG
// now carries its own notarization ticket, so it opens offline the first time.
export const release: Release | null = {
  version: '1.0.2',
  name: '1.0.2',
  date: '2026-10-15',
  url: `${releases}/tag/v1.0.2`,
  dmg: {
    file: 'Sudo-Play-1.0.2-arm64.dmg',
    url: `${releases}/download/v1.0.2/Sudo-Play-1.0.2-arm64.dmg`,
    size: '148 MB',
    sha256: 'b40e25cd44002387ebcbe54707ad56636d16c7c0d1f649bbc862d31e5d875d0f',
  },
};

// The sudo-play commit the copy was last checked against. Without a release,
// this is what the pages describe.
export const checkedAt = 'f1974fa';

export function releaseNote(current: Release | null = release): string {
  return current ? `The current release is ${current.name}.` : 'There is no release yet.';
}
