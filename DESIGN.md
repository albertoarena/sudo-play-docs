---
name: Sudo Play docs
description: The documentation site for Sudo Play. A terminal on a quiet page.
colors:
  bg: "#ffffff"
  bg-subtle: "#fafafa"
  fg: "#18181b"
  fg-muted: "#52525c"
  border: "#e4e4e7"
  border-strong: "#71717b"
  accent: "#007a55"
  accent-hover: "#006045"
  on-accent: "#ffffff"
  warn: "#bb4d00"
  focus: "#007a55"
  bg-dark: "#09090b"
  bg-subtle-dark: "#18181b"
  fg-dark: "#f4f4f5"
  fg-muted-dark: "#9f9fa9"
  border-dark: "#27272a"
  accent-dark: "#00d492"
  accent-hover-dark: "#5ee9b5"
  on-accent-dark: "#09090b"
  warn-dark: "#ffb900"
  focus-dark: "#00d492"
  term-bg: "#09090b"
  term-fg: "#f4f4f5"
  term-green: "#00d492"
  term-dim: "#9f9fa9"
  term-edge: "#27272a"
  term-dots: "#3f3f46"
  term-focus: "#00d492"
typography:
  display:
    fontFamily: "'Geist Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "clamp(1.375rem, 0.9rem + 2.2vw, 2.375rem)"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "clamp(2rem, 1.55rem + 1.8vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title-small:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  nav:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
  small:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  code:
    fontFamily: "'Geist Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "'Geist Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  inline: "4px"
  control: "6px"
  block: "10px"
  panel: "16px"
spacing:
  gutter: "clamp(1rem, 4vw, 2rem)"
  measure: "66ch"
  frame: "72rem"
  band: "3.5rem"
  paragraph: "1.125rem"
  block: "1.5rem"
  section: "3rem"
components:
  masthead:
    backgroundColor: "{colors.term-bg}"
    textColor: "{colors.term-dim}"
    height: "{spacing.band}"
  nav-link:
    textColor: "{colors.term-dim}"
    typography: "{typography.nav}"
  nav-link-hover:
    textColor: "{colors.term-fg}"
  nav-link-current:
    textColor: "{colors.term-green}"
  terminal-panel:
    backgroundColor: "{colors.term-bg}"
    textColor: "{colors.term-green}"
    typography: "{typography.display}"
    rounded: "{rounded.panel}"
    padding: "clamp(1rem, 3vw, 1.5rem) clamp(1.25rem, 4vw, 2.5rem) clamp(1.75rem, 5vw, 3rem)"
  code-block:
    backgroundColor: "{colors.bg-subtle}"
    textColor: "{colors.fg}"
    typography: "{typography.code}"
    rounded: "{rounded.block}"
    padding: "1rem 1.25rem"
  inline-code:
    backgroundColor: "{colors.bg-subtle}"
    textColor: "{colors.fg}"
    rounded: "{rounded.inline}"
    padding: "0.1em 0.35em"
  note:
    backgroundColor: "{colors.bg-subtle}"
    textColor: "{colors.fg}"
    rounded: "{rounded.block}"
    padding: "1rem 1.25rem"
  link:
    textColor: "{colors.accent}"
  link-hover:
    textColor: "{colors.accent-hover}"
  skip-link:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.875rem"
---

# Design System: Sudo Play docs

The reasons behind every decision here are in `docs/DIRECTION.md`. This file
records the system as built. Where the two disagree, DIRECTION.md wins and the
code is the bug.

## Overview

**Creative North Star: "The popover, at page size"**

The site is the app's menu bar popover, widened into a document. The app's
composition carries over as the frame: a dark terminal band on top, a quiet
light body below. The band holds the mark and the navigation on every page. On
Home it grows into the full terminal panel with the brand line at display size.
Everything under the band is a plain reading column.

The brand lives in the frame, never in the text. Running text is the system
sans in a 66ch column on a plain page. Mono appears in three places only: the
panel, code, and small labels. The page is flat and still. There are no
shadows, no motion and no syntax colours, and one green that only ever means
"act here" or "you are here".

Light and dark follow `prefers-color-scheme`, with no toggle. The band and the
panel are dark in both modes. Code blocks follow the page, so in light mode
they are light, and the dark panel stays the one dark object that means
identity.

**Key Characteristics:**
- A dark band (56px) in both modes, with the mark, the name and one row of nav
- One emerald accent; zinc neutrals with a faint cool violet cast
- System sans for reading, Geist Mono for the panel, code and labels
- Flat, borders instead of shadows, nothing moves
- Six pages read in order, with previous and next at the end of each, and
  Credits outside the order, linked from the footer

## Colors

Zinc neutrals and one emerald, in three sets: light page, dark page, and a
terminal set that is the same in both modes. Measured contrast for every pair
is in `docs/DIRECTION.md`, and `tests/tokens.test.ts` checks them.

### Primary
- **Deep Emerald** (`accent`, light) and **Signal Emerald** (`accent-dark`):
  links, the selected state and the skip link fill. Hover deepens in light
  (`accent-hover`) and brightens in dark (`accent-hover-dark`).
- **Terminal Green** (`term-green`): the command in the panel, the current
  nav link and its three bars, and the mark's bars.

### Neutral
- **Paper** (`bg`) and **Ink Black** (`bg-dark`): the page.
- **Faint Zinc** (`bg-subtle`, `bg-subtle-dark`): code blocks, inline code
  and notes.
- **Zinc Ink** (`fg`, `fg-dark`): body text and headings.
- **Muted Zinc** (`fg-muted`, `fg-muted-dark`): captions, list
  markers, the footer, the "Previous" and "Next" direction words.
- **Hairline** (`border`, `border-dark`): dividers and block edges. It is
  decorative only and never the sole edge of a control.
- **Strong Zinc** (`border-strong`, both modes): table header rules and the
  code scrollbar.
- **Terminal set** (`term-bg`, `term-fg`, `term-dim`, `term-edge`,
  `term-dots`, `term-focus`): the band and the panel only. `term-dim` sets the
  nav and the `$`; `term-edge` outlines the panel, and the band in dark mode;
  `term-dots` fills the window dots.

### Tertiary
- **Warning Amber** (`warn`, `warn-dark`): defined and reserved for real
  warnings and errors. No phase 2 surface uses it yet.

### Named Rules
**The One Green Rule.** Green means "act here" or "you are here". It never
decorates: no green headings, rules, icons or syntax colours.

**The Amber Means Trouble Rule.** Information uses `fg-muted`, never `warn`.

**The Own Hues Rule.** These tokens are the only colours. Zinc sits at hue 286
and emerald at 163; never mix in another grey or green.

**The Dim Text Rule.** On a dark ground, muted text is `#9f9fa9`, never
`#71717b`. Strong Zinc is a border colour there, not a text colour.

## Typography

**Body Font:** the system sans (`system-ui`, SF Pro on a Mac)
**Label/Mono Font:** Geist Mono, self hosted, one variable file (weights 100
to 900), with `ui-monospace` and SF Mono behind it

**Character:** the reader's own native face for reading, set tight and dark in
headings; a mono close to SF Mono where the identity and the code live. Geist
Mono was chosen from a specimen of four pairs and is decided.

### Hierarchy
- **Display** (Geist Mono 500, fluid 22 to 38px, 1.3): the brand line in the
  Home panel only. It wraps in the app's parts, `sudo play` then each flag
  with its value, and a continued line is indented two columns.
- **Headline** (700, fluid 32 to 44px, 1.1, tight tracking): the one `h1` per
  page.
- **Title** (650, 24px, 1.25): `h2`, with 3rem above it.
- **Title small** (650, 19px, 1.3): `h3`.
- **Lead** (400, 19px, 1.55): the paragraph under the `h1`.
- **Body** (400, 17px, 1.6): running text in a 66ch column.
- **Nav** (15px): masthead links. The brand name beside the mark is the same
  size at 650.
- **Small** (14px): footer and tables (tables are 15px, tabular figures).
- **Code** (Geist Mono 14px, 1.65): code blocks; inline code is 0.875em.
- **Label** (Geist Mono 12px, 1.4): unused since 2026-10-12, when its only
  use, the label on a code block, was removed. Kept for small labels.

Headings use balanced wrapping and the lead uses pretty wrapping. `strong` is
650, not 700.

### Named Rules
**The Mono in Three Places Rule.** Geist Mono sets the panel, code and small
labels. Nothing else.

**The No Ligatures Rule.** Mono text sets `font-variant-ligatures: none`, so
`=>` and `--` stay as typed.

## Layout

One centred frame (72rem) with a fluid gutter (16 to 32px). Inside it, the
masthead, the main area and the footer share the same edges. Page content sits
in a single column capped at 66ch, centred in the frame. There is no
sidebar and no table of contents.

Main has fluid top and bottom padding (about 40 to 72px above, 48 to 80px
below). Vertical rhythm: 1.125rem between paragraphs, 1.5rem around code
blocks and tables, 3rem above an `h2`, 2.25rem above an `h3`. Previous and next
sit 4rem below the column, centred with it, in two equal cells.

The masthead is one row, at least 56px: brand on the left, nav on the right.
Below 40rem it stacks, with the nav wrapping under the name in compact rows.
Below 22rem the five links sit in a three column grid, so a row never strands
one link. There is never a menu button. Home's band adds a hero area under the
row for the panel.

The consent banner is fixed to the bottom edge, on `--bg` with a
`--border-strong` hairline on top: the title and one sentence on the left,
Decline and Accept analytics on the right. The two buttons share one class and
two equal grid columns, and both are outlined in `--border-strong` with text
in `--fg`, so refusing is never smaller or quieter than agreeing. Neither is
green: no answer is styled as the expected one. While the banner shows, it sets
`--banner-space` to its height, and the footer keeps that much room at the
bottom, so nothing at the end of a page is hidden under it. It only exists
when a measurement ID is set.
Everything works at 320px with no horizontal page scroll; wide code and tables
scroll inside their own box.

## Elevation & Depth

The system is flat. There are no box shadows. Depth comes from tone: the dark
band and panel against the light page, and Faint Zinc blocks against Paper,
each with a 1px hairline. Two small functional exceptions exist. A code block
that scrolls shows a soft edge shade only on the side where more code is
hidden, and a `kbd` key has a 2px bottom border.

### Named Rules
**The Flat Page Rule.** Separate with tone and a hairline, never a shadow.

**The Still Page Rule.** Nothing moves, Home included. No transitions, no load
animation.

## Shapes

Gently rounded rectangles, in four steps: 4px for inline code, 6px for small
controls (the skip link), 10px for blocks (code blocks,
notes), and 16px for the terminal panel. The band is square and full bleed.
The mark's bars and the "you are here" bars are small rounded rectangles; the
window dots are circles. Borders are always 1px, except the 2px focus ring.

## Components

### Masthead
The app's header, as chrome. Dark `term-bg` in both modes; in dark mode a 1px
`term-edge` line separates it from the page. The brand link is the mark (28px
wide) and "Sudo Play" in `term-fg`. Inside the band the focus ring switches to
`term-focus`.

### Navigation
- **Style:** five text links in `term-dim`, no underline, 24px apart.
- **Hover:** `term-fg`.
- **Current:** `term-green`, with `aria-current="page"` and three small
  equaliser bars (3px wide, 6px tall at most, heights 45%, 100% and 73%)
  centred under the link. Home's current state is the brand link itself.
- **Mobile:** wraps under the name, no JavaScript, no hamburger.

### Terminal Panel (signature)
The brand line, only on Home, inside the band. `term-bg` with a 1px
`term-edge` and 16px corners. Three `term-dots` window dots (10px, 7px apart),
then `$ sudo play --genre rock --mood debugging` in Display type: the `$` in
`term-dim`, the words in `term-green`. It is not code. It has no label and no
Copy button.

### Code Block
Real code a reader types or pastes, as a bare `pre`: a 1px hairline, 10px
corners, `bg-subtle` ground and text in `fg`, with no syntax colours. It
scrolls sideways inside itself with a thin Strong Zinc scrollbar and edge
shades. No page uses one yet. The labelled block with a Copy button was
removed on 2026-10-12, because no page had real code; see `docs/DIRECTION.md`.

### Inline Code and Keys
Inline code: `bg-subtle`, 1px hairline, 4px corners, 0.875em, breaks
anywhere. `kbd`: `bg`, 1px hairline with a 2px bottom, 5px corners, centred.

### Note
Something worth knowing that is not a warning. `bg-subtle`, 1px hairline,
10px corners, 1rem by 1.25rem padding, opening with a bold word.

### Links
`accent`, 1px underline offset 0.2em. Hover: `accent-hover` and a 2px
underline. Focus everywhere is a 2px `focus` outline at 2px offset.
A link to another site opens in a new tab, as on trussphp.com, and says so in
hidden text for a screen reader. It always goes through `ExternalLink`.

### Tables
Full width in a scrolling wrap, rows split by hairlines, the header rule in
`border-strong`, header cells at 600, tabular figures.

### App Window
A screenshot of an app window, in a `figure class="window"` styled in
`global.css`. Cropped from a 2x capture without the macOS shadow, since the site
is flat, and shown at its natural size. The window's own 22px radius, and a
`border` hairline so it has an edge on a page of its own colour. WebP files in
`public/screenshots/`, each under 80 KB.

- **Home**, under the opening paragraph: the menu bar window, light or dark to
  match the visitor, through `<picture>`. 360 by 520. Light and dark show
  different picks, so the one alt text names neither
- **How it works**, at the end of Play: the Settings window, 440 by 680. There
  is one capture, light, so it stays light on a dark page

The source is the app repository's `art/screenshots/`: when those change, crop
and convert again.

### Previous and Next
The page's neighbours in reading order, in two cells at the end of every page.
Home has only Next and Privacy only Previous. Each is a
hairline on top, a muted direction word, and the page name at 650 in `fg`.
Hover turns the name and the top line `accent`.

### Footer
A hairline on top, muted 14px text, links in `fg` that turn `accent` on hover.
Links to the app's GitHub, README, CONTRIBUTING and PRIVACY, which open in a
new tab like every external link. Then Credits,
Analytics settings when analytics are on, and the line that Sudo Play is not
affiliated with Spotify.

## Do's and Don'ts

### Do:
- **Do** keep the band about 56px on inner pages. Only Home grows it.
- **Do** mark the current page with `term-green` and the three bars, and
  nothing else.
- **Do** set real code in a Code Block, light in light mode.
- **Do** keep the brand line in the Terminal Panel, wrapping between parts.
- **Do** keep running text in the system sans, in the 66ch column.
- **Do** author focus: 2px `focus` outline at 2px offset, `term-focus` inside
  the band and the panel.
- **Do** check every new layout at 320px for horizontal scroll.

### Don't:
- **Don't** set running text in mono or on the terminal ground. `term-bg`
  belongs to the band and the panel only; the page follows the reader's
  light or dark setting.
- **Don't** give the tagline a Copy button or a code block, or present it as
  something to type.
- **Don't** use green, or any colour, as decoration or as syntax highlighting.
- **Don't** use `warn` for information.
- **Don't** add a shadow, a transition or an animation.
- **Don't** add a sidebar, a hamburger menu or JavaScript for navigation.
- **Don't** load a font, icon or script from another host. Fonts are self
  hosted.
