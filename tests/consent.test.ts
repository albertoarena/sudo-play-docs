import { describe, expect, it } from 'vitest';
import {
  ACCEPTED,
  DECLINED,
  STORAGE_KEY,
  analyticsAllowed,
  clearConsent,
  readConsent,
  shouldShowBanner,
  storeConsent,
} from '../src/scripts/consent';

// The decision that governs whether Google is contacted at all. It lives in a
// plain module so it can be tested here without a browser. Ported with its
// tests from laravel-truss-docs.

// A localStorage stand in. `broken` models Safari private mode and any browser
// where the visitor blocked site data: there, touching storage throws.
function fakeStorage({ initial = {}, broken = false }: { initial?: Record<string, string>; broken?: boolean } = {}) {
  const data: Record<string, string> = { ...initial };
  const boom = () => {
    throw new Error('storage unavailable');
  };
  return {
    data,
    getItem: broken ? boom : (key: string) => (key in data ? data[key] : null),
    setItem: broken ? boom : (key: string, value: string) => void (data[key] = String(value)),
    removeItem: broken ? boom : (key: string) => void delete data[key],
  };
}

it('stores the choice under a key named for this site', () => {
  expect(STORAGE_KEY).toBe('sudoplay-consent');
});

describe('consent state', () => {
  it('shows the banner when no choice has been made', () => {
    expect(shouldShowBanner(null)).toBe(true);
  });

  it('hides the banner once a choice exists, either way', () => {
    expect(shouldShowBanner(ACCEPTED)).toBe(false);
    expect(shouldShowBanner(DECLINED)).toBe(false);
  });

  // A stale or hand edited value must never be read as consent by accident.
  it('treats an unknown stored value as no choice', () => {
    expect(shouldShowBanner('yes')).toBe(true);
    expect(shouldShowBanner('')).toBe(true);
  });

  it('allows analytics on an explicit accept and on nothing else', () => {
    expect(analyticsAllowed(ACCEPTED)).toBe(true);
    expect(analyticsAllowed(DECLINED)).toBe(false);
    expect(analyticsAllowed(null)).toBe(false);
    expect(analyticsAllowed('granted')).toBe(false);
  });
});

describe('consent storage', () => {
  it('round trips a choice', () => {
    const storage = fakeStorage();
    storeConsent(storage, ACCEPTED);

    expect(readConsent(storage)).toBe(ACCEPTED);
    expect(storage.data[STORAGE_KEY]).toBe(ACCEPTED);
  });

  it('reads an unknown stored value as no choice', () => {
    expect(readConsent(fakeStorage({ initial: { [STORAGE_KEY]: 'yes' } }))).toBeNull();
  });

  it('clears a choice, which is how consent is withdrawn', () => {
    const storage = fakeStorage({ initial: { [STORAGE_KEY]: ACCEPTED } });
    clearConsent(storage);

    expect(readConsent(storage)).toBeNull();
    expect(shouldShowBanner(readConsent(storage))).toBe(true);
  });

  it('refuses to store anything but a real choice', () => {
    const storage = fakeStorage();

    expect(() => storeConsent(storage, 'maybe')).toThrow();
    expect(storage.data[STORAGE_KEY]).toBeUndefined();
  });

  // If a throw took the script down, the banner would never show.
  it('degrades to no choice when storage throws', () => {
    const storage = fakeStorage({ broken: true });

    expect(readConsent(storage)).toBeNull();
    expect(() => storeConsent(storage, ACCEPTED)).not.toThrow();
    expect(() => clearConsent(storage)).not.toThrow();
  });

  it('degrades to no choice when there is no storage at all', () => {
    expect(readConsent(undefined)).toBeNull();
    expect(() => storeConsent(undefined, ACCEPTED)).not.toThrow();
    expect(() => clearConsent(undefined)).not.toThrow();
  });
});
