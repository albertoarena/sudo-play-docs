/*
  The visitor's analytics choice. Ported from laravel-truss-docs.

  A plain module, not logic inside the banner, because this is the decision
  that governs whether Google is contacted at all. tests/consent.test.ts is
  its specification.

  The choice lives in localStorage, not a cookie, so a decline leaves nothing
  that is sent to a server. Every storage access is wrapped: storage can throw
  outright (Safari private mode, blocked site data), and a throw must read as
  "no choice yet", never take the script down with the banner unshown.
*/

export const STORAGE_KEY = 'sudoplay-consent';
export const ACCEPTED = 'accepted';
export const DECLINED = 'declined';

export type Choice = typeof ACCEPTED | typeof DECLINED;

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>;

function isChoice(value: unknown): value is Choice {
  return value === ACCEPTED || value === DECLINED;
}

// The stored choice, or null when absent, unreadable or not a known value.
export function readConsent(storage: Storage | undefined): Choice | null {
  try {
    const value = storage?.getItem(STORAGE_KEY);
    return isChoice(value) ? value : null;
  } catch {
    return null;
  }
}

// The banner shows until an explicit choice exists.
export function shouldShowBanner(stored: string | null): boolean {
  return !isChoice(stored);
}

// Analytics run on an explicit accept and on nothing else.
export function analyticsAllowed(stored: string | null): boolean {
  return stored === ACCEPTED;
}

export function storeConsent(storage: Storage | undefined, choice: string): void {
  if (!isChoice(choice)) {
    throw new Error(`Refusing to store "${choice}" as a consent choice`);
  }
  try {
    storage?.setItem(STORAGE_KEY, choice);
  } catch {
    // The choice holds for this page view. It just cannot be remembered.
  }
}

// Withdraws consent: the visitor is back to no choice.
export function clearConsent(storage: Storage | undefined): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // As above.
  }
}
