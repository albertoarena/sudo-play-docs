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

// 1.0.4, published on 2026-11-15. The app no longer changes its own files when
// it starts, so macOS keeps accepting its signature after the first launch.
export const release: Release | null = {
  version: '1.0.4',
  name: '1.0.4',
  date: '2026-11-15',
  url: `${releases}/tag/v1.0.4`,
  dmg: {
    file: 'Sudo-Play-1.0.4-arm64.dmg',
    url: `${releases}/download/v1.0.4/Sudo-Play-1.0.4-arm64.dmg`,
    size: '163 MB',
    sha256: 'c4ae4f0547b6b641c0739c47beba9f595bae1e4c51a7595f0d598e2ee62c03cd',
  },
};

// The sudo-play commit the copy was last checked against. Without a release,
// this is what the pages describe.
export const checkedAt = '77cef32';

export function releaseNote(current: Release | null = release): string {
  return current ? `The current release is ${current.name}.` : 'There is no release yet.';
}
