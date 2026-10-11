// @ts-check
import { defineConfig } from 'astro/config';

// .dev is HSTS preloaded, so the canonical host is https only.
export default defineConfig({
  site: 'https://sudoplay.dev',
  // No syntax colours: green is the only accent and never decorates.
  // docs/DIRECTION.md, "How the shell is built".
  markdown: {
    syntaxHighlight: false,
  },
});
