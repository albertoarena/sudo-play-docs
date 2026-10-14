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

// The first signed and notarized build, published on 2026-10-14. It replaced
// 1.0.0 beta 1, which was unsigned.
export const release: Release | null = {
  version: '1.0.0',
  name: '1.0.0',
  date: '2026-10-14',
  url: `${releases}/tag/v1.0.0`,
  dmg: {
    file: 'Sudo-Play-1.0.0-arm64.dmg',
    url: `${releases}/download/v1.0.0/Sudo-Play-1.0.0-arm64.dmg`,
    size: '170 MB',
    sha256: '2e4419bab91257a60b9dbf52ffc1f07ccf15678ad1f385d431de4c6444838212',
  },
};

// The sudo-play commit the copy was last checked against. Without a release,
// this is what the pages describe.
export const checkedAt = '3661324';

export function releaseNote(current: Release | null = release): string {
  return current ? `The current release is ${current.name}.` : 'There is no release yet.';
}
