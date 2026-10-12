// The app release this site documents. Every page that mentions the release
// reads it from here, so the first release is one edit to this file, plus the
// Install steps, which a person checks against the real build.
export interface Release {
  version: string;
  date: string;
  url: string;
}

// null until the first signed release ships.
export const release: Release | null = null;

// The sudo-play commit the copy was last checked against. Without a release,
// this is what the pages describe.
export const checkedAt = '91e0fd9';

export function releaseNote(current: Release | null = release): string {
  return current ? `The current release is ${current.version}.` : 'There is no release yet.';
}
