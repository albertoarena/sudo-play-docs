import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The colour tokens, read from source, checked against WCAG 2: 4.5 for text,
// 3 for UI edges and focus. The pairs are the ones docs/DIRECTION.md lists.
const css = readFileSync('src/styles/tokens.css', 'utf8');

function declarations(block: string): Record<string, string> {
  return Object.fromEntries(
    [...block.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi)].map(([, name, hex]) => [name, hex.toLowerCase()]),
  );
}

function rootBlock(source: string): string {
  return source.match(/:root\s*{([^}]*)}/)?.[1] ?? '';
}

const darkMedia = css.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*{([\s\S]*?})\s*}/)?.[1] ?? '';
const light = declarations(rootBlock(css.replace(darkMedia, '')));
const dark = { ...light, ...declarations(rootBlock(darkMedia)) };

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const text: [string, string][] = [
  ['--fg', '--bg'],
  ['--fg', '--bg-subtle'],
  ['--fg-muted', '--bg'],
  ['--fg-muted', '--bg-subtle'],
  ['--accent', '--bg'],
  ['--accent-hover', '--bg'],
  ['--on-accent', '--accent'],
  ['--warn', '--bg'],
];

const ui: [string, string][] = [
  ['--border-strong', '--bg'],
  ['--focus', '--bg'],
  ['--focus', '--bg-subtle'],
];

// The terminal is the same in both modes.
const terminalText: [string, string][] = [
  ['--term-fg', '--term-bg'],
  ['--term-green', '--term-bg'],
  ['--term-dim', '--term-bg'],
];
const terminalUi: [string, string][] = [['--term-focus', '--term-bg']];

describe.each([
  ['light', light],
  ['dark', dark],
])('%s', (_, tokens) => {
  it.each(text)('%s on %s is at least 4.5', (fg, bg) => {
    expect(tokens[fg], fg).toBeDefined();
    expect(tokens[bg], bg).toBeDefined();
    expect(ratio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(ui)('%s on %s is at least 3', (fg, bg) => {
    expect(tokens[fg], fg).toBeDefined();
    expect(tokens[bg], bg).toBeDefined();
    expect(ratio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(3);
  });

  it.each(terminalText)('%s on %s is at least 4.5', (fg, bg) => {
    expect(ratio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(terminalUi)('%s on %s is at least 3', (fg, bg) => {
    expect(ratio(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(3);
  });
});

it('keeps the terminal the same in both modes', () => {
  for (const name of Object.keys(light).filter((n) => n.startsWith('--term-'))) {
    expect(dark[name], name).toBe(light[name]);
  }
});
