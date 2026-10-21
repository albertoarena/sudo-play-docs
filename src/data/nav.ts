// The site's pages in reading order. The masthead, previous and next, and the
// tests all read this one list, so a page is added here and nowhere else.
export interface Page {
  href: string;
  label: string;
}

export const pages: readonly Page[] = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works/', label: 'How it works' },
  { href: '/install/', label: 'Install' },
  { href: '/moods/', label: 'Moods' },
  { href: '/tips/', label: 'Tips' },
  { href: '/troubleshooting/', label: 'Help' },
  { href: '/privacy/', label: 'Privacy' },
];

// Pages outside the reading order, linked from the footer instead, as
// trussphp.com does. They are in the sitemap but not the masthead.
export const footerPages: readonly Page[] = [{ href: '/credits/', label: 'Credits' }];

export const home = pages[0];

// The pages the masthead lists. Home is the brand link, not a nav item.
export const navPages = pages.slice(1);

// The page before and after the given path, following the reading order.
export function neighbours(path: string): { previous?: Page; next?: Page } {
  const index = pages.findIndex((page) => page.href === normalise(path));
  if (index === -1) return {};
  return { previous: pages[index - 1], next: pages[index + 1] };
}

// Astro gives `/install/` for a page and `/` for home; accept either form.
export function normalise(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}
