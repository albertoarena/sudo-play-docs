import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Two licences, decided 2026-10-13: MIT for the code, CC BY 4.0 for the text
// of the pages and the link preview image. The README says which is which.
describe('licences', () => {
  it('puts the code under MIT', () => {
    const licence = readFileSync('LICENSE', 'utf8');
    expect(licence).toMatch(/^MIT License/);
    expect(licence).toContain('Copyright (c) 2026 Alberto Arena');
  });

  it('puts the text under CC BY 4.0', () => {
    const licence = readFileSync('LICENSE-CONTENT', 'utf8');
    expect(licence).toContain('Attribution 4.0 International');
  });

  it('says in the README which licence covers what', () => {
    const readme = readFileSync('README.md', 'utf8');
    const section = readme.split(/^## Licence$/m)[1]?.split(/^## /m)[0] ?? '';
    for (const name of ['`LICENSE`', '`LICENSE-CONTENT`', 'OFL.txt', 'public/og.png', 'name and mark']) {
      expect(section).toContain(name);
    }
  });
});
