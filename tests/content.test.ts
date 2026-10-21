import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { moods } from '../src/data/catalog';
import { release, releaseNote } from '../src/data/release';
import { STORAGE_KEY } from '../src/scripts/consent';

// Phase 3 checks on the built copy. Like dist.test.ts, these read dist/, so
// `npm test` needs a `npm run build` before it.
const dist = 'dist';
const app = 'https://github.com/albertoarena/sudo-play';

// Pages whose copy is written. A page joins this list when phase 3 replaces
// its placeholder, and the list ends as every page.
const finished = ['index.html', 'how-it-works/index.html', 'install/index.html', 'moods/index.html', 'privacy/index.html', 'tips/index.html', 'troubleshooting/index.html', 'credits/index.html'];

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

// The guard the finished list cannot give: a page left off the list would
// ship its placeholder. This one finds every page itself, so it stays red
// until phase 3 has written all of them.
it('ships no page with placeholder text', () => {
  const pages = existsSync(dist) ? htmlFiles(dist) : [];
  const unfinished = pages.filter((file) => readFileSync(file, 'utf8').includes('data-placeholder'));

  expect(pages).not.toHaveLength(0);
  expect(unfinished, 'These pages still carry the placeholder marker').toEqual([]);
});

function read(file: string): string {
  const path = join(dist, file);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

// The page's own content, without the masthead, footer and previous and next.
// A page outside the reading order, like Credits, has no previous and next.
function column(html: string): string {
  return html.match(/<div class="column"[^>]*>([\s\S]*?)<\/div>\s*(?:<nav[^>]*aria-label="Previous and next"|<\/main>)/)?.[1] ?? '';
}

// Astro may write an apostrophe as &#39; and a quote as &quot;.
function decode(html: string): string {
  return html.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}

function links(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((match) => match[1]);
}

describe.each(finished)('%s', (file) => {
  const html = read(file);

  it('carries no placeholder text', () => {
    expect(html).not.toBe('');
    expect(html).not.toContain('data-placeholder');
    expect(html).not.toMatch(/placeholder/i);
  });

  // AGENTS.md: plain English, no em dashes and no en dashes.
  it('has no em dash and no en dash', () => {
    expect(column(html)).not.toBe('');
    expect(column(html)).not.toMatch(/[–—]|&[mn]dash;/);
  });

  // The genre is "Lo-fi" in prose, as in Moods and the catalog label.
  // `lofi` is only ever a code value. Decided 2026-10-13.
  it('spells the genre Lo-fi', () => {
    expect(column(html)).not.toMatch(/\blofi\b/i);
  });
});

describe('Home', () => {
  const content = column(read('index.html'));

  it('points to the pages that follow', () => {
    expect(links(content)).toEqual(expect.arrayContaining(['/how-it-works/', '/install/', '/moods/']));
  });

  // The app's promise is about the app. Any copy that states it names the app.
  it('names Sudo Play when it states the app promise', () => {
    const sentence = content.match(/[^.>]*no analytics[^.<]*/i)?.[0] ?? '';

    expect(sentence).toMatch(/Sudo Play|The app/);
  });

  // The site runs analytics after consent, so "no analytics" must be plainly
  // about the app. Approved 2026-10-13.
  // One screenshot of the window, light or dark to match the visitor, at its
  // natural width. Placement approved 2026-10-13. Retaken with real playlists
  // on 2026-10-14: light and dark show different picks, and one alt serves
  // both, so it names no pick. Approved 2026-10-14.
  it('shows the app window, light or dark, with its approved alt text', () => {
    const picture = content.match(/<picture\b[^>]*>[\s\S]*?<\/picture>/)?.[0] ?? '';

    expect(picture).toMatch(/<source\b[^>]*media="\(prefers-color-scheme: dark\)"[^>]*srcset="\/screenshots\/window-dark\.webp"/);
    expect(picture).toMatch(/<img\b[^>]*src="\/screenshots\/window-light\.webp"/);
    expect(picture).toMatch(/\bwidth="360"/);
    expect(picture).toMatch(/\bheight="520"/);
    // Astro may write the apostrophe as &#39;.
    expect(picture.replace(/&#39;/g, "'")).toContain(
      "alt=\"The Sudo Play window. A genre and a mood are selected, and today's pick is shown with its curator, with Play, Next and Surprise me below.\"",
    );
  });

  // Every capture ships with the site, and stays light enough for a phone.
  it('ships every screenshot, each under 80 KB', () => {
    for (const name of ['window-light', 'window-dark', 'settings']) {
      const file = join(dist, 'screenshots', `${name}.webp`);
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size, file).toBeLessThan(80 * 1024);
    }
  });

  // A download on Home, under the lead and above the window, so a visitor
  // from a launch post finds it without scrolling. The DMG link and the
  // details come from src/data/release.ts, so a release changes them with
  // the rest of the site. Approved 2026-10-20.
  describe('download', () => {
    const block = content.match(/<div class="download"[\s\S]*?<\/div>/)?.[0] ?? '';
    const text = decode(block).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');

    it('sits under the lead and above the window', () => {
      expect(block).not.toBe('');
      expect(content.indexOf('class="lead"')).toBeLessThan(content.indexOf('class="download"'));
      expect(content.indexOf('class="download"')).toBeLessThan(content.indexOf('class="window"'));
    });

    it('links the DMG from the data file', () => {
      expect(links(block)[0]).toBe(release!.dmg.url);
      expect(text).toContain('Download for Mac');
    });

    it('says what the download is, and where the first open is explained', () => {
      expect(text).toContain(`${release!.name} for Apple silicon (M1 or later), ${release!.dmg.size}. Signed and notarized.`);
      expect(text).toContain('Install has the steps for opening Sudo Play the first time.');
      expect(links(block)).toContain('/install/#download-and-install');
    });

    // A screen reader hears the details line with the button itself.
    it('describes the button with the details line', () => {
      const id = block.match(/<a\b[^>]*\baria-describedby="([^"]+)"/)?.[1] ?? '';

      expect(id).not.toBe('');
      expect(block).toMatch(new RegExp(`<p\\b[^>]*\\bid="${id}"[^>]*>[^<]*Apple silicon`));
    });
  });

  // The beta's "Not signed yet" note went with the signed 1.0.0.
  it('has no warning note', () => {
    expect(content).not.toContain('class="note warning"');
  });

  it('says it is the app that has no analytics', () => {
    expect(content).toContain('The app has no accounts, no analytics and no tracking.');
  });
});

describe('Privacy', () => {
  const content = column(read('privacy/index.html'));

  // Link, do not copy: the app's policy lives in the app repository.
  it('links to the app privacy policy', () => {
    expect(links(content)).toContain(`${app}/blob/main/PRIVACY.md`);
  });

  it('says what this site loads and what it does not', () => {
    expect(content).toMatch(/cookie/i);
    expect(content).toMatch(/font/i);
    expect(content).toMatch(/third part/i);
  });

  // The site will run GA4 behind the consent gate, so Privacy says so from the
  // first day it is live, and never that the site has no analytics.
  it('says Google Analytics loads only after the visitor accepts', () => {
    expect(content).toMatch(/Google Analytics/);
    expect(content).toMatch(/accept/i);
    expect(content).not.toMatch(/no analytics/i);
  });

  // Claims must match behaviour: a key the code stores and the page does not
  // name is how a privacy page becomes untrue.
  it('names the key the choice is stored under', () => {
    expect(content).toContain(STORAGE_KEY);
  });

  it('says how to change or withdraw the choice', () => {
    expect(content).toMatch(/Analytics settings/);
    expect(content).toMatch(/footer/i);
  });

  // The Copy button and its script went with the code block on 2026-10-12.
  // The banner is the site's one script now.
  it('describes the script the site has, not the one it removed', () => {
    expect(content).not.toMatch(/Copy button/i);
    expect(content).toMatch(/script[^.]*banner|banner[^.]*script/i);
  });

  // The facts below were decided on 2026-10-12. The page is rewritten from
  // laravel-truss-docs' privacy page, keeping only what is true here.
  it('names the data controller and the contact address', () => {
    expect(content).toMatch(/Alberto Arena/);
    expect(content).toMatch(/data controller/i);
    expect(links(content)).toContain('mailto:hello@albertoarena.it');
  });

  // The app repository is private, so an issue link does not work for a
  // visitor. The email address replaces it.
  it('does not send visitors to GitHub issues', () => {
    expect(links(content).filter((href) => href.includes('/issues'))).toEqual([]);
  });

  it('says what Google Analytics records after an accept', () => {
    for (const fact of [/pages you visit/i, /referring page/i, /approximate location/i, /device and browser/i, /scroll/i, /links? (leading|leaving)[^.]*site/i]) {
      expect(content).toMatch(fact);
    }
    expect(content).toMatch(/Google Signals/);
    expect(content).toMatch(/processor/i);
  });

  it('keeps the data for 14 months', () => {
    expect(content).toMatch(/14 months/);
  });

  it('says nothing from Google loads before Accept, not even a cookieless ping', () => {
    expect(content).toMatch(/cookieless ping/i);
    expect(content).toMatch(/(decline|ignore)[^.]*never contacted|never contacted[^.]*(decline|ignore)/i);
  });

  it('names the Google cookies, set only after an accept', () => {
    expect(content).toContain('<code>_ga</code>');
    expect(content).toContain('<code>_ga_&lt;id&gt;</code>');
  });

  it('gives the legal basis for each kind of processing', () => {
    expect(content).toMatch(/consent[^.]*Article 6\(1\)\(a\)/i);
    expect(content).toMatch(/legitimate interest[^.]*Article 6\(1\)\(f\)/i);
  });

  it('says where the data goes and under what framework', () => {
    expect(content).toMatch(/Google LLC/);
    expect(content).toMatch(/United States/);
    expect(content).toMatch(/EU-US Data Privacy Framework/);
  });

  // DNS is on Cloudflare, DNS only and never proxied (AGENTS.md), so
  // Cloudflare answers the lookup and never sees a page request.
  it('says Cloudflare is DNS only, not a proxy', () => {
    const table = content.match(/<table[\s\S]*?<\/table>/)?.[0] ?? '';
    const row = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((match) => match[1]).find((cells) => /<td>Cloudflare/.test(cells)) ?? '';

    expect(content).not.toMatch(/prox(y|ies)/i);
    expect(content).not.toMatch(/Cloudflare[^.]*every request|every request[^.]*Cloudflare/i);
    expect(row).toMatch(/DNS only/);
  });

  it('lists the third parties in a table', () => {
    const table = content.match(/<table[\s\S]*?<\/table>/)?.[0] ?? '';
    const rows = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((row) => row[1]);

    for (const who of ['Cloudflare', 'Google', 'hosting provider']) {
      expect(rows.some((row) => new RegExp(`<td>[^<]*${who}`, 'i').test(row)), who).toBe(true);
    }
    expect(table).toMatch(/Italy/);
  });

  it('covers links to other sites, your rights and changes, with a date', () => {
    expect(content).toMatch(/<h2>Links to other sites<\/h2>/);
    expect(content).toMatch(/<h2>Your rights<\/h2>/);
    expect(content).toMatch(/<h2>Changes<\/h2>/);
    expect(content).toMatch(/Last updated: \d{1,2} [A-Z][a-z]+ \d{4}/);
  });

  // True on trussphp.com, not here. Cloudflare Web Analytics stays off: its
  // script would be a third party request before consent.
  it('claims nothing that is only true of the Truss site', () => {
    for (const claim of [/Web Analytics/i, /European endpoint/i, /theme builder/i, /\bdemo\b/i, /In the wild/i]) {
      expect(content).not.toMatch(claim);
    }
  });
});

describe('Moods', () => {
  const content = column(read('moods/index.html'));

  it('lists every mood from the catalog, in catalog order', () => {
    const positions = moods.map((mood) => content.indexOf(mood.label));

    expect(positions.every((position) => position !== -1)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    for (const mood of moods) expect(content).toContain(mood.description);
  });

  // The label already says what the mood is, so a screen reader skips the
  // emoji, as it does in the app.
  it('shows each emoji once, hidden from screen readers', () => {
    for (const mood of moods) {
      expect(content.split(mood.emoji), mood.id).toHaveLength(2);
      expect(content).toMatch(new RegExp(`<[^>]*aria-hidden="true"[^>]*>${mood.emoji}<`));
    }
  });

  // The catalog's text mixes feelings and moments, and reads naturally after
  // "Feels like". Decided 2026-10-12.
  it('heads the description column "Feels like"', () => {
    expect(content).toMatch(/<th scope="col">Feels like<\/th>/);
  });

  it('says the moods come from the app catalog', () => {
    expect(content).toMatch(/catalog/i);
  });

  // Link, do not copy: adding a playlist is documented in the app's README.
  it('links to the README section on adding a playlist', () => {
    expect(links(content)).toContain(`${app}/blob/main/README.md#adding-a-playlist`);
  });
});

describe('How it works', () => {
  const content = column(read('how-it-works/index.html'));
  const table = content.match(/<table[\s\S]*?<\/table>/)?.[0] ?? '';

  // The Settings window, after Play, which sends the reader to Settings for
  // the other player modes. Light only: there is one capture. Placement
  // approved 2026-10-14.
  it('shows the Settings window after Play, with its alt text', () => {
    const play = content.split(/<h2[^>]*>Play<\/h2>/)[1]?.split(/<h2/)[0] ?? '';
    const img = play.match(/<figure\b[^>]*>\s*<img\b[^>]*>\s*<\/figure>/)?.[0] ?? '';

    expect(img).toMatch(/\bsrc="\/screenshots\/settings\.webp"/);
    expect(img).toMatch(/\bwidth="440"/);
    expect(img).toMatch(/\bheight="680"/);
    expect(img).toContain(
      'alt="The Sudo Play Settings window, with a default genre and mood, the three ways to play, the daily reminder, opening when you log in, and the catalog URL."',
    );
  });

  it('says the pick is the same all day and changes tomorrow', () => {
    expect(content).toMatch(/same all day/i);
    expect(content).toMatch(/tomorrow/i);
  });

  it('says what Play does, including when Spotify is closed', () => {
    expect(content).toMatch(/Spotify is closed/);
    expect(content).toMatch(/open only/);
    expect(content).toMatch(/web player/);
  });

  it('names Next and Surprise me', () => {
    expect(content).toMatch(/Next/);
    expect(content).toMatch(/Surprise me/);
    expect(content).not.toMatch(/placeholder/i);
  });

  it('lists every key in a table', () => {
    for (const key of ['Enter', 'N', 'S', 'Esc', 'Tab']) expect(table).toContain(`<kbd>${key}</kbd>`);
    expect(table).toMatch(/arrow keys/i);
  });

  // The app's code at checkedAt falls back to autoplay when nothing is chosen,
  // which is why the permission prompt appears without a visit to Settings.
  it('says autoplay is the default player mode', () => {
    expect(content).toMatch(/autoplay[^.]*default|default[^.]*autoplay/i);
  });

  it('mentions the optional daily reminder', () => {
    expect(content).toMatch(/daily reminder/i);
  });

  // PRIVACY.md describes the permission; this page links to it.
  it('explains the Automation permission and links to the app privacy policy', () => {
    expect(content).toMatch(/Automation/);
    expect(content).toMatch(/System Settings/);
    expect(links(content)).toContain(`${app}/blob/main/PRIVACY.md`);
  });

  // Moods has the table, and the README explains adding a playlist.
  it('points to Moods and the README instead of copying them', () => {
    expect(links(content)).toContain('/moods/');
    expect(links(content)).toContain(`${app}/blob/main/README.md#adding-a-playlist`);
    expect(content).not.toContain('catalog/playlists.yaml');
    for (const mood of moods) expect(content).not.toContain(mood.description);
  });
});

describe('Install', () => {
  const content = column(read('install/index.html'));

  it('states the release from the data file', () => {
    expect(content).toContain(releaseNote(release));
  });

  // The signed 1.0.0, as Alberto opened it on his Mac on 2026-10-14: one
  // "downloaded from the internet" question, then Spotify's permission prompt
  // on the first Play. The wording is the app README's, from sudo-play PR 38.
  describe('the signed release', () => {
    const text = decode(content);
    const install = text.split(/<h2[^>]*>Download and install<\/h2>/)[1]?.split(/<h2/)[0] ?? '';

    it('says what it needs and links the DMG and the release', () => {
      expect(content).toMatch(/<h2 id="download-and-install">Download and install<\/h2>/);
      expect(install).toContain('You need a Mac with Apple silicon, M1 or later, and the Spotify app or a browser. There is no Intel build yet.');
      expect(links(content)).toEqual(expect.arrayContaining([release!.dmg.url, release!.url]));
    });

    it('has three steps, ending with the one question macOS asks', () => {
      const steps = install.match(/<ol>([\s\S]*?)<\/ol>/)?.[1] ?? '';
      const items = [...steps.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) =>
        match[1].replace(/<span class="new-tab"[^>]*>[^<]*<\/span>/g, '').replace(/<[^>]+>/g, ''),
      );

      expect(items).toEqual([
        `Download ${release!.dmg.file} (${release!.dmg.size}) from the ${release!.name} release.`,
        'Install. Open the DMG and drag Sudo Play to Applications.',
        'Open Sudo Play. macOS asks once whether to open an app downloaded from the internet. Click Open.',
      ]);
    });

    it('says to allow Spotify control on the first Play', () => {
      expect(install).toContain('The first time you press Play, macOS asks whether Sudo Play may control Spotify. Click Allow, so it can start the playlist in the Spotify app.');
    });

    // Any earlier version, as in sudo-play PR 46: no version updates itself.
    it('tells a user of an earlier version how to replace it', () => {
      expect(install).toContain('<strong>Coming from an earlier version?</strong> Download the DMG and drag Sudo Play to Applications, then choose Replace. Your settings stay. The app does not update itself.');
    });

    it('gives the checksum to check the download', () => {
      expect(text).toMatch(/<h2[^>]*>Check the download<\/h2>/);
      expect(text).toContain(`<code>shasum -a 256 ~/Downloads/${release!.dmg.file}</code>`);
      expect(text).toContain(`<code>${release!.dmg.sha256}</code>`);
    });

    it('says how to hear about new releases, and why the app does not check', () => {
      expect(text).toMatch(/<h2[^>]*>Hear about new releases<\/h2>/);
      expect(text).toMatch(/Watch, then Custom, then Releases/);
      expect(text).toContain('Sudo Play does not check for updates itself, because the daily catalog download is its only network call.');
    });

    it('has none of the unsigned steps', () => {
      expect(content).not.toMatch(/Open Anyway|Install the beta|install-the-beta|not signed/);
    });
  });

  // Anyone can run it from source now. The app README has the steps, and the
  // site links to them rather than keeping a second copy that would drift.
  // Since db3d53a the app ships a copy of the catalog, as its README says.
  it('links to the app README for running from source, without copying the steps', () => {
    expect(content).toMatch(/<h2 id="run-it-from-source">Run it from source<\/h2>/);
    expect(content).toMatch(/You can also run Sudo Play on a Mac with PHP 8\.4, Composer and Node 22 or later\./);
    expect(links(content)).toContain(`${app}#run-it-from-source`);
    expect(content).toMatch(/A copy of the catalog ships with the app, so it has playlists to suggest from the first run, even offline\./);
    expect(content).not.toMatch(/nothing to suggest/);
    expect(content).not.toMatch(/composer setup|native:serve|git clone/);
  });

  // The beta's warning note went with the signed build.
  it('has no note, and no alert', () => {
    expect(content.match(/class="note[ "]/g)?.length ?? 0).toBe(0);
    expect(content).not.toMatch(/role="(note|alert)"/);
  });
});

describe('Tips', () => {
  const content = column(read('tips/index.html'));

  // Drafted from the app's README, PRIVACY.md and code at checkedAt, and
  // approved by Alberto on 2026-10-12.
  it('gives the tips the app sources support', () => {
    expect(content).toMatch(/same playlist/i);
    expect(content).toMatch(/Open Sudo Play when I log in/);
    expect(content).toMatch(/Remind me of today(&#39;|')s pick/);
    expect(content).toMatch(/default genre and mood/i);
    expect(content).toMatch(/web player/i);
    expect(content).toMatch(/catalog URL/i);
    expect(content).toMatch(/within a day/i);
  });

  it('points to How it works and the README instead of copying them', () => {
    expect(links(content)).toContain('/how-it-works/');
    expect(links(content)).toContain(`${app}/blob/main/README.md#adding-a-playlist`);
  });
});

// The tools and people behind Sudo Play, as trussphp.com has. Approved
// 2026-10-13. Reached from the footer, not the masthead.
describe('Credits', () => {
  const html = read('credits/index.html');
  const page = column(html);

  it('credits the app stack', () => {
    for (const tool of ['Laravel', 'NativePHP', 'Inertia', 'Vue', 'Tailwind CSS', 'Pest', 'PHPUnit', 'Vitest', 'Larastan', 'Pint']) {
      expect(page).toContain(tool);
    }
  });

  it('credits the site stack', () => {
    for (const tool of ['Astro', 'TypeScript', 'Geist Mono', 'SIL Open Font License', 'Playwright', 'axe-core']) {
      expect(page).toContain(tool);
    }
  });

  it("names the author and links to the author's GitHub profile", () => {
    expect(page).toContain('Alberto Arena');
    expect(links(page)).toContain('https://github.com/albertoarena');
  });

  it('states the licences and links to them and the trademark policy', () => {
    expect(page).toContain('MIT');
    expect(page).toContain('CC BY 4.0');
    expect(links(page)).toEqual(
      expect.arrayContaining([
        `${app}/blob/main/LICENSE`,
        `${app}/blob/main/TRADEMARK.md`,
        'https://github.com/albertoarena/sudo-play-docs/blob/main/LICENSE',
        'https://github.com/albertoarena/sudo-play-docs/blob/main/LICENSE-CONTENT',
      ]),
    );
  });
});

// The wording pass of 2026-10-14: the humanizer and docs/sentence-clarity.md
// on every page, each fix approved by Alberto one at a time. Each sentence is
// checked whole, and the line it replaced must be gone.
describe('the 2026-10-14 wording pass', () => {
  function text(file: string): string {
    return column(read(file)).replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  }

  it.each([
    ['credits/index.html', 'Sudo Play and this site are built with these open-source tools.', 'stands on excellent'],
    ['privacy/index.html', 'The server that hosts this site records each request in its access logs, with the IP address it came from.', 'Like any web server'],
    ['privacy/index.html', 'The hosting provider holds these logs to keep the site secure and to fix problems.', 'keeps these logs'],
    ['privacy/index.html', 'A decline is stored there too, so no server can read it.', 'refusing leaves nothing'],
    ['privacy/index.html', 'Google Analytics, loaded only after you accept', 'Never contacted otherwise'],
    ['privacy/index.html', 'If this site is going to collect anything new, this page changes before it does, and so does the date at the top.', 'not after'],
    ['how-it-works/index.html', 'It lets Sudo Play send a play command to Spotify on the same Mac. It gives the app\'s makers no data.', 'on the same Mac, and it gives'],
    ['tips/index.html', 'The app then gets its daily download from that address, instead of from the default one.', 'That server'],
    ['tips/index.html', 'In Settings, turn on "Open Sudo Play when I log in" and "Remind me of today\'s pick".', 'launch at login'],
  ])('%s says: %s', (file, now, before) => {
    expect(text(file)).toContain(now);
    expect(text(file)).not.toContain(before);
  });
});

// For the problem seen on 2026-10-21: the app's background PHP process stops,
// every action in the window fails and the reminder still arrives. The
// messages are the app's own words, from the 1.0.2 tag. Where the fix lives
// is undecided, so the page promises none. Asked for on 2026-10-21. The
// nav says Help, so the masthead keeps two rows at 320px. It ends the
// order: nobody reads it in turn, and Help sits where people look for it.
describe('Troubleshooting', () => {
  const html = read('troubleshooting/index.html');
  const content = decode(column(html));

  it('ends the masthead, after Privacy, as Help', () => {
    const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? '';
    const hrefs = links(header);

    expect(hrefs.indexOf('/troubleshooting/')).toBe(hrefs.indexOf('/privacy/') + 1);
    expect(hrefs.at(-1)).toBe('/troubleshooting/');
    expect(header).toMatch(/<a\b[^>]*href="\/troubleshooting\/"[^>]*>Help\b/);
  });

  it('quotes the messages the window shows', () => {
    for (const message of [
      'Something went wrong. Please try again.',
      'Could not open the settings. Please try again.',
      'Could not open the browser.',
      'Could not quit. Please try again.',
    ]) {
      expect(content).toContain(message);
    }
  });

  it('says to quit from the menu bar icon, with killall as the fallback', () => {
    expect(content).toContain('Quit Sudo Play');
    expect(content).toContain('<code>killall "Sudo Play"</code>');
  });

  it('says where the log is, and that this problem leaves none', () => {
    expect(content).toContain('<code>~/Library/Application Support/sudo-play/storage/logs/</code>');
    expect(content).toMatch(/empty/);
  });

  it('promises no fix and no version', () => {
    expect(content).not.toMatch(/will be fixed|next (release|version)|\b\d+\.\d+\.\d+\b/i);
  });
});
