// Renders public/og.png, the link preview image every page names in og:image.
// Run it by hand when the design or the tagline changes, and commit the PNG:
//
//   npm run og:image
//
// It draws the Home terminal panel at 1200 by 630 with the site's own tokens,
// mark and fonts, so the image matches the site without a design tool. As on
// the site, Geist Mono sets only the brand line, and the name and the line
// under it are the system sans, as in the masthead. That is SF Pro on a Mac,
// the face a Mac visitor sees, so the script runs only on macOS: elsewhere the
// system sans differs and the PNG would change with whoever ran it.
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

if (process.platform !== 'darwin') {
  console.error('og:image draws the name in the system sans, so run it on macOS.');
  process.exit(1);
}

const font = readFileSync('public/fonts/geist-mono/geist-mono-latin-wght-normal.woff2').toString('base64');

// The term-* tokens from src/styles/tokens.css. The terminal is the same in
// both colour schemes, so a preview looks the same on a light or dark page.
const term = {
  bg: '#09090b',
  fg: '#f4f4f5',
  green: '#00d492',
  dim: '#9f9fa9',
  edge: '#27272a',
  dots: '#3f3f46',
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Geist Mono';
    src: url(data:font/woff2;base64,${font}) format('woff2');
    font-weight: 100 900;
  }

  * { box-sizing: border-box; }

  body {
    width: 1200px;
    height: 630px;
    margin: 0;
    padding: 56px 80px 64px;
    display: flex;
    flex-direction: column;
    background: ${term.bg};
    color: ${term.dim};
    font-family: 'Geist Mono', monospace;
    font-variant-ligatures: none;
  }

  .dots { display: flex; gap: 12px; }
  .dots i { width: 16px; height: 16px; border-radius: 50%; background: ${term.dots}; }

  .line {
    margin: auto 0;
    padding-left: 2ch;
    text-indent: -2ch;
    color: ${term.green};
    font-size: 64px;
    font-weight: 500;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .part { white-space: nowrap; }
  .prompt { color: ${term.dim}; }

  .foot {
    display: flex;
    align-items: center;
    gap: 24px;
    padding-top: 40px;
    border-top: 2px solid ${term.edge};
  }

  .mark { width: 72px; height: auto; flex: none; }
  .brand { font-family: system-ui, -apple-system, sans-serif; }
  .name { color: ${term.fg}; font-size: 40px; font-weight: 650; line-height: 1.2; letter-spacing: -0.015em; }
  .tagline { font-size: 28px; line-height: 1.4; }
</style>
</head>
<body>
  <div class="dots"><i></i><i></i><i></i></div>
  <p class="line"><span class="prompt">$</span> <span class="part">sudo play</span> <span class="part">--genre rock</span> <span class="part">--mood debugging</span></p>
  <div class="foot">
    <svg class="mark" viewBox="2 4 40 26">
      <path d="M4.6 8.4 13.2 16 4.6 23.6" fill="none" stroke="${term.dim}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
      <g fill="${term.green}">
        <rect x="20" y="18" width="4" height="10" rx="1" />
        <rect x="28" y="6" width="4" height="22" rx="1" />
        <rect x="36" y="12" width="4" height="16" rx="1" />
      </g>
    </svg>
    <div class="brand">
      <div class="name">Sudo Play</div>
      <div class="tagline">A macOS menu bar app: today's Spotify playlist for your coding mood.</div>
    </div>
  </div>
</body>
</html>`;

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og.png' });
await browser.close();
