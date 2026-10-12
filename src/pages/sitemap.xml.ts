import type { APIRoute } from 'astro';
import { pages } from '../data/nav';

// The sitemap, built from the same page list as the nav. It has no lastmod:
// the build cannot know when a page's copy last changed, and a wrong date is
// worse than none.
export const GET: APIRoute = ({ site }) => {
  const urls = pages.map((page) => `  <url><loc>${new URL(page.href, site)}</loc></url>`);
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
