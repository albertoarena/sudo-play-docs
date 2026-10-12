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

