# Direction: the design of sudoplay.dev

Written 2026-10-11, in phase 2 of [`docs/PLAN.md`](PLAN.md). This file records
the design decisions and why each was made. `PRODUCT.md` says who the site is
for. The root `DESIGN.md`, written at the end of phase 2, records the tokens and
components as built. If this file and the code disagree, the decision here wins
and the code is the bug, unless a later entry here changes the decision.

## The direction: the popover, at page size

Approved 2026-10-11.

The colours are fixed by `.docs/COLOURS.md`: zinc, one emerald, and a dark
terminal panel. So the question was never which world, but how the site carries
it. The answer is the app's own composition: a dark terminal header over a quiet
body. The site is the menu bar popover, widened into a document.

**The rule underneath it: the frame carries the brand, and the reading column
stays plain.** The site is not a terminal costume. No monospace running text,
no green on black pages, no ASCII menus. That is the category default for a
developer tool, and it makes documentation harder to read. Mono appears only in
the panel, in code, and in small labels.

### The masthead is the app's header

A dark band across the top of every page, in both modes, in `--term-bg`. It
holds the mark (a dim `>` and three green bars, copied from the app's `art/`)
and the navigation, with links in `--term-dim`. In dark mode a 1px `#27272a`
edge separates the band from the page.

The band stays about 56px tall on inner pages, so it reads as chrome and not as
a hero. A dark band on a white page is heavy if it grows. Home is the only page
where it does.

### The bars mean "you are here"

The current page's link is `--term-green`, carries `aria-current="page"`, and
sits over three small equaliser bars. That is the one recurring sign, and it
follows the colour rule: green means "act here" or "you are here", never
decoration.

### The terminal panel is the brand line, and only on Home

On Home the band grows into the full panel: the three window dots from the app
icon, then `$ sudo play --genre rock --mood debugging` at display size, a dim
`$` and a green command. There is no copy button, because nothing there is meant
to be typed. `PRODUCT.md` makes this binding: the tagline is not a command.

### Code blocks are different on purpose

In light mode a code block is light: `--bg-subtle` with a border, a filename or
language label, and a Copy button. Only the panel is dark, and the dark panel
means identity. In dark mode the panel keeps its dots and has no label, and code
blocks sit on `#18181b`. Nobody should mistake the tagline for a command.

### Wayfinding

Six pages do not need a sidebar. The navigation is one row. At 320px it wraps to
a second line under the logo: no hamburger, and no JavaScript for the
navigation. Every page ends with previous and next links in reading order:

Home, How it works, Install, Moods, Tips, Privacy.

A page gets its own table of contents only if phase 3 makes it long.

### Light and dark

Both follow `prefers-color-scheme`. There is no toggle. The band is dark in both
modes.

### One colour addition

`--term-focus: #00d492`, for the focus ring inside the dark band and the panel.
The light mode `--focus`, `#007a55`, measures about 3.6 against `#09090b`. That
passes the 3 to 1 rule for a focus indicator, but only just. Every other token
stays as `.docs/COLOURS.md` writes it.

### The footer

The links to the app on GitHub and to its `README.md`, `CONTRIBUTING.md` and
`PRIVACY.md`, and a line saying Sudo Play is not affiliated with Spotify. The
footer leaves room for the small consent banner that phase 5 adds. Phase 2 does
not build the banner.

### The alternative not taken

A plain light header, with the dark panel only on Home. It is calmer, but the
inner pages would look like any documentation site with the product's name
swapped in.

### Placeholder text

Mock pages in phase 2 use placeholder text only, clearly marked as placeholder,
and none of it ships as real copy. Real copy arrives in phase 3.

## Fonts: the system sans and Geist Mono

Approved 2026-10-11, chosen from a specimen of four pairs.

- **Body text and headings: the system sans.** `system-ui` is SF Pro on a Mac,
  the face the app itself uses, and every user of the app is on a Mac. It costs
  nothing to download and never flashes while loading. Windows and Linux readers
  get their own native face, which is fine for running text
- **The panel, code and small labels: Geist Mono, self hosted.** The panel is
  where the identity lives, so its face must not depend on the operating
  system. Of the candidates, Geist Mono is the closest to SF Mono, the app's
  mono. One variable file, Latin subset, about 23 KB
- **Licence: SIL Open Font License 1.1**, copyright 2024 The Geist Project
  Authors. The licence text is committed beside the font file, as the OFL
  requires

Not chosen: Geist for the body too (the same on every OS, but 29 KB for a face
Mac readers already have), JetBrains Mono (its ligatures turn `=>` into an
arrow, and it looks least like the app), Commit Mono (close to SF Mono, but
fixed weights at 48 KB each), Atkinson Hyperlegible Next and Mono (built for
legibility, and the least like the app).

One rule for the build: the command in the panel never breaks inside a flag. It
wraps between words, never in the middle of `--mood`.

## Motion: none

Decided 2026-10-11. Nothing moves, Home included. The site is for reading, and
the app's icon is still. A bounce of the Home bars on load was offered and
declined.

## How the shell is built

Decided 2026-10-11.

- **One small script: the Copy button.** About twenty lines, our own, inline,
  no request. The button exists only when the script runs, so without
  JavaScript there is no button and nothing broken
- **No syntax colours.** Astro's Shiki highlighting is off. Code is set in
  `--fg`, with keys and comments in `--fg-muted`. Green never decorates
- **All six routes exist from phase 2, as placeholders.** Each one shows a
  visible Placeholder label and carries a marker that a phase 3 test can
  forbid, so placeholder text cannot ship by accident
- **Accessibility is tested with axe** through `@axe-core/playwright`, a dev
  dependency that runs inside the test browser and makes no request. It checks
  every page in light and dark, beside the hand written checks for landmarks,
  one `h1`, focus, token contrast and the 320px width
