import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// Every built page as a URL path, read from dist/ so a new page is covered
// without editing a spec. `npm run check` builds before Playwright collects.
export function builtPages(dir = 'dist'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return builtPages(path);
    if (!entry.name.endsWith('.html')) return [];
    const url = '/' + relative('dist', path).split(sep).join('/');
    return [url.replace(/(^|\/)index\.html$/, '$1')];
  });
}

// No written page has real code yet, so the code block and its Copy button
// are tested on the phase 2 mock, kept on a page that is still a
// placeholder. When that page is written, move the mock or test real code.
export const mockPage = '/tips/';
