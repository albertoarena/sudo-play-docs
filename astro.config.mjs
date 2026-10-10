// @ts-check
import { defineConfig } from 'astro/config';

// .dev is HSTS preloaded, so the canonical host is https only.
export default defineConfig({
  site: 'https://sudoplay.dev',
});
