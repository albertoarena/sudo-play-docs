import { describe, expect, it } from 'vitest';
import { GA_SCRIPT_ORIGIN, consentSignals, gtagUrl, loadAnalytics, measurementId } from '../src/scripts/analytics';

// The tag loader. Its whole job is to contact Google once, and only after an
// explicit accept. Ported with its tests from laravel-truss-docs.

type FakeScript = { async: boolean; src: string };

// A document stand in that records what is appended to the head.
function fakeDoc() {
  const appended: FakeScript[] = [];
  return {
    appended,
    createElement: (): FakeScript => ({ async: false, src: '' }),
    querySelector: (selector: string) => {
      const prefix = selector.match(/src\^="([^"]+)"/)?.[1];
      return prefix ? (appended.find((script) => script.src.startsWith(prefix)) ?? null) : null;
    },
    head: { appendChild: (script: FakeScript) => appended.push(script) },
  };
}

function fakeWin(): { dataLayer?: IArguments[] } {
  return {};
}

function load(id: string, doc = fakeDoc(), win = fakeWin()) {
  loadAnalytics({ id, doc: doc as unknown as Document, win: win as unknown as Window });
  return { doc, win };
}

describe('the measurement ID', () => {
  // Unset is the switch for the whole feature: no ID, no banner, no tag.
  it('is empty when unset or blank', () => {
    expect(measurementId(undefined)).toBe('');
    expect(measurementId('')).toBe('');
    expect(measurementId('  ')).toBe('');
  });

  it('accepts a GA4 ID, trimmed', () => {
    expect(measurementId(' G-ABC123XYZ ')).toBe('G-ABC123XYZ');
  });

  // A typo in the repository variable fails the build instead of shipping a
  // banner that asks for consent to a tag that cannot work.
  it('fails on anything that is not a GA4 ID', () => {
    expect(() => measurementId('UA-12345-1')).toThrow();
    expect(() => measurementId('G-abc')).toThrow();
    expect(() => measurementId("G-1';alert(1)//")).toThrow();
  });
});

describe('the gtag URL', () => {
  it('points at Google with the measurement ID', () => {
    expect(gtagUrl('G-ABC123')).toBe(`${GA_SCRIPT_ORIGIN}/gtag/js?id=G-ABC123`);
  });

  it('encodes the ID rather than putting it in raw', () => {
    expect(gtagUrl('G-A B')).not.toContain(' ');
  });
});

describe('consent signals', () => {
  const signals = consentSignals();

  it('grants analytics storage, because this only runs after an accept', () => {
    expect(signals.analytics_storage).toBe('granted');
  });

  it('denies every advertising signal, for ever', () => {
    expect(signals.ad_storage).toBe('denied');
    expect(signals.ad_user_data).toBe('denied');
    expect(signals.ad_personalization).toBe('denied');
  });

  // It holds an already loaded tag while a choice is pending. Nothing is
  // loaded here before the choice, so it has nothing to hold.
  it('carries no wait_for_update', () => {
    expect(signals).not.toHaveProperty('wait_for_update');
  });
});

describe('loading the tag', () => {
  it('appends one async script for the measurement ID', () => {
    const { doc } = load('G-ABC123');

    expect(doc.appended).toHaveLength(1);
    expect(doc.appended[0].src).toBe(gtagUrl('G-ABC123'));
    expect(doc.appended[0].async).toBe(true);
  });

  it('does nothing without a measurement ID', () => {
    const { doc, win } = load('');

    expect(doc.appended).toHaveLength(0);
    expect(win.dataLayer).toBeUndefined();
  });

  it('runs once, so accepting twice cannot count a page view twice', () => {
    const doc = fakeDoc();
    const win = fakeWin();
    load('G-ABC123', doc, win);
    load('G-ABC123', doc, win);

    expect(doc.appended).toHaveLength(1);
    expect(win.dataLayer!.filter((args) => args[0] === 'config')).toHaveLength(1);
  });

  it('sends consent before config, so the signals apply to the first hit', () => {
    const { win } = load('G-ABC123');
    const calls = win.dataLayer!.map((args) => Array.from(args));
    const consentAt = calls.findIndex((call) => call[0] === 'consent');
    const configAt = calls.findIndex((call) => call[0] === 'config');

    expect(consentAt).toBeGreaterThanOrEqual(0);
    expect(configAt).toBeGreaterThan(consentAt);
    expect(calls[consentAt][1]).toBe('default');
    expect(calls[consentAt][2]).toEqual(consentSignals());
    expect(calls[configAt][1]).toBe('G-ABC123');
  });
});
