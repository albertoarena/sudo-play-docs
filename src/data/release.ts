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

// 1.0.1, published on 2026-10-14, signed and notarized like 1.0.0 before it,
// which replaced the unsigned 1.0.0 beta 1 the same day.
export const release: Release | null = {
  version: '1.0.1',
  name: '1.0.1',
  date: '2026-10-14',
  url: `${releases}/tag/v1.0.1`,
  dmg: {
    file: 'Sudo-Play-1.0.1-arm64.dmg',
    url: `${releases}/download/v1.0.1/Sudo-Play-1.0.1-arm64.dmg`,
    size: '169 MB',
    sha256: 'abe61bcd9d03d9372930bf7dca2e013220479f14012f9614cf0763e68c01dda9',
  },
};

// The sudo-play commit the copy was last checked against. Without a release,
// this is what the pages describe.
export const checkedAt = 'e6bf50f';

export function releaseNote(current: Release | null = release): string {
  return current ? `The current release is ${current.name}.` : 'There is no release yet.';
}
