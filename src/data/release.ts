// The app release this site documents. Every page that mentions the release
// reads it from here, so the first release is one edit to this file, plus the
// Install steps, which a person checks against the real build.
export interface Release {
  version: string;
  // The version as a reader says it: "1.0.0 beta 1".
  name: string;
  date: string;
  url: string;
  // False until Apple approves the developer account. While it is false,
  // Install opens with a warning and the Open Anyway steps, and Home says the
  // build is not signed yet. Setting it true removes all of that.
  signed: boolean;
  dmg: { file: string; url: string; size: string; sha256: string };
}

const releases = 'https://github.com/albertoarena/sudo-play/releases';

// The first build, a pre-release published on 2026-10-14.
export const release: Release | null = {
  version: '1.0.0-beta.1',
  name: '1.0.0 beta 1',
  date: '2026-10-14',
  url: `${releases}/tag/v1.0.0-beta.1`,
  signed: false,
  dmg: {
    file: 'Sudo-Play-1.0.0-beta.1-arm64.dmg',
    url: `${releases}/download/v1.0.0-beta.1/Sudo-Play-1.0.0-beta.1-arm64.dmg`,
    size: '167 MB',
    sha256: '8507c1af91e4f362376fb01bb72cb2512cbbf14ebfada94599b0795d36c52f1f',
  },
};

// The sudo-play commit the copy was last checked against. Without a release,
// this is what the pages describe.
export const checkedAt = 'de23e8d';

export function releaseNote(current: Release | null = release): string {
  return current ? `The current release is ${current.name}.` : 'There is no release yet.';
}
