// @ts-check
import { defineConfig } from 'astro/config';

// .dev is HSTS preloaded, so the canonical host is https only.
export default defineConfig({
  site: 'https://sudoplay.dev',
  // `npm run build:consent` sets this to dist-consent/: a second build with a
  // test measurement ID, so e2e/consent.spec.ts can test the banner while the
  // other specs test the site without one. Astro's preview has no flag for it.
  outDir: process.env.SITE_OUT_DIR || './dist',
  // No syntax colours: green is the only accent and never decorates.
  // docs/DIRECTION.md, "How the shell is built".
  markdown: {
    syntaxHighlight: false,
  },
});
