import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { expect, it } from 'vitest';

// Fonts come from the site itself, never a CDN: a font from another origin is
// a third party request before consent. Each font travels with its licence.
const dist = 'dist';

function files(dir: string, ext: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path, ext);
    return entry.name.endsWith(ext) ? [path] : [];
  });
}

function fontFaces(): { css: string; block: string }[] {
  const sheets = files(dist, '.css');
  const inline = files(dist, '.html').map((file) => [file, readFileSync(file, 'utf8')] as const);
  return [
    ...sheets.map((file) => [file, readFileSync(file, 'utf8')] as const),
    ...inline,
  ].flatMap(([css, text]) => (text.match(/@font-face\s*{[^}]*}/g) ?? []).map((block) => ({ css, block })));
}

const faces = fontFaces();

it('declares Geist Mono', () => {
  expect(faces.some(({ block }) => /font-family:\s*["']?Geist Mono/.test(block))).toBe(true);
});

it('serves every font from the site itself, beside its licence', () => {
  for (const { css, block } of faces) {
    const urls = [...block.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map(([, url]) => url);
    expect(urls.length, block).toBeGreaterThan(0);

    for (const url of urls) {
      expect(url, `${url} in ${css}`).not.toMatch(/^(https?:)?\/\//);
      const path = url.startsWith('/') ? join(dist, url) : join(dirname(css), posix.normalize(url));
      expect(existsSync(path), path).toBe(true);
      expect(existsSync(join(dirname(path), 'OFL.txt')), `OFL.txt beside ${path}`).toBe(true);
    }
  }
});
