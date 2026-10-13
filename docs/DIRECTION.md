# Direction: the design of sudoplay.dev

Written 2026-10-11, in phase 2 of [`docs/PLAN.md`](PLAN.md). This file records
the design decisions and why each was made. `PRODUCT.md` says who the site is
for. The root `DESIGN.md`, written at the end of phase 2, records the tokens and
components as built. If this file and the code disagree, the decision here wins
and the code is the bug, unless a later entry here changes the decision.

## The direction: the popover, at page size

Approved 2026-10-11.

The colours are fixed (see Colours below): zinc, one emerald, and a dark
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

Changed 2026-10-12: no page in phase 3 has real code, so the labelled code
block and its Copy button were removed, with their tests. A bare `pre` keeps
the look above, without the label or the button. If a page ever needs real
code, this section is the design to bring back; git has the component.

### Wayfinding

Six pages do not need a sidebar. The navigation is one row. At 320px it wraps to
a second line under the logo: no hamburger, and no JavaScript for the
navigation. Every page ends with previous and next links in reading order:

Home, How it works, Install, Moods, Tips, Privacy.

A page gets its own table of contents only if phase 3 makes it long.

The reading column, and previous and next under it, sit in the middle of the
page. Decided 2026-10-11 in review: the first build aligned the column with the
mark, which left the right side of a wide screen empty. The band keeps the full
frame, so on a wide screen the mark sits left of the column's edge.

### Light and dark

Both follow `prefers-color-scheme`. There is no toggle. The band is dark in both
modes.

### One colour addition

`--term-focus: #00d492`, for the focus ring inside the dark band and the panel.
The light mode `--focus`, `#007a55`, measures about 3.6 against `#09090b`. That
passes the 3 to 1 rule for a focus indicator, but only just. Every other token
is as Alberto's scheme wrote it. `--term-edge` and `--term-dots` only name
values the app's CSS and icon already use.

### The footer

The links to the app on GitHub and to its `README.md`, `CONTRIBUTING.md` and
`PRIVACY.md`, which open in a new tab as on trussphp.com, a link to Credits,
and a line saying Sudo Play is not affiliated with Spotify. The
footer leaves room for the small consent banner, through `--banner-space`. The
banner came in phase 5, and `DESIGN.md` describes it as built.

### The alternative not taken

A plain light header, with the dark panel only on Home. It is calmer, but the
inner pages would look like any documentation site with the product's name
swapped in.

### Placeholder text

Mock pages in phase 2 use placeholder text only, clearly marked as placeholder,
and none of it ships as real copy. Real copy arrives in phase 3.

## Colours

Approved 2026-10-11. Taken from the scheme Alberto derived from the app and
contrast checked on 2026-10-10, with one addition, `--term-focus`, explained
below. These are the only colours the site uses. Zinc carries a faint cool
violet (hue 286) and emerald sits at 163: never mix in Tailwind's plain grey or
green, which have different hues. Ratios are WCAG 2, measured: AA needs 4.5 for
text and 3 for UI edges and focus.

### Light

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--bg` | `#ffffff` | Page | |
| `--bg-subtle` | `#fafafa` | Code blocks, inline code, notes | |
| `--fg` | `#18181b` | Body text | 17.7 on bg |
| `--fg-muted` | `#52525c` | Secondary text, captions | 7.7 on bg |
| `--border` | `#e4e4e7` | Dividers, code block edges (decorative only) | 1.3, not a UI edge |
| `--border-strong` | `#71717b` | Edges of inputs and outline buttons | 4.8 on bg |
| `--accent` | `#007a55` | Links, selected state | 5.4 on bg |
| `--accent-hover` | `#006045` | Hover and pressed | 7.6 with white |
| `--on-accent` | `#ffffff` | Text on accent fill | 5.4 on accent |
| `--warn` | `#bb4d00` | Real warnings and errors only. Reserved | 5.0 on bg |
| `--focus` | `#007a55` | 2px outline, 2px offset | 5.4 on bg |

### Dark

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--bg` | `#09090b` | Page | |
| `--bg-subtle` | `#18181b` | Code blocks, inline code, notes | |
| `--fg` | `#f4f4f5` | Body text | 18.1 on bg |
| `--fg-muted` | `#9f9fa9` | Secondary text | 7.6 on bg, 6.8 on subtle |
| `--border` | `#27272a` | Dividers (decorative only) | |
| `--border-strong` | `#71717b` | Edges of inputs and outline buttons | 4.1 on bg |
| `--accent` | `#00d492` | Links, selected state | 10.3 on bg |
| `--accent-hover` | `#5ee9b5` | Hover | 13.1 with dark text |
| `--on-accent` | `#09090b` | Text on accent fill | 10.3 on accent |
| `--warn` | `#ffb900` | Real warnings and errors only. Reserved | 11.6 on bg |
| `--focus` | `#00d492` | 2px outline, 2px offset | 10.3 on bg |

### The terminal, the same in both modes

The masthead band and the Home panel.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--term-bg` | `#09090b` | Band and panel | 19.9 against a white page |
| `--term-fg` | `#f4f4f5` | Plain text, the site name | 18.1 |
| `--term-green` | `#00d492` | The command, the current page, the bars | 10.3 |
| `--term-dim` | `#9f9fa9` | The `$`, nav links, the `>` of the mark | 7.6 |
| `--term-edge` | `#27272a` | Band and panel edge on the dark page | decorative |
| `--term-dots` | `#3f3f46` | The three window dots, as in the app icon | decorative |
| `--term-focus` | `#00d492` | Focus ring inside the band and the panel | 10.3 |

### Rules

- **One accent.** Green means "act here" or "you are here". Never decoration
- **Amber is for problems only.** Information uses `--fg-muted`, never `--warn`.
  No phase 2 surface needs it. It stays defined for the first real warning,
  likely on Install, rather than being removed and contrast checked again.
  Decided 2026-10-12
- **Tables have no stripes.** Rows are split by a `--border` hairline and the
  header by `--border-strong`. Changed 2026-10-12: stripes were planned in
  `--bg-subtle`, but `#fafafa` on white barely shows, and stripes beside
  hairlines would be two ways of doing one job. Revisit if a page needs a long
  table
- **Never `#71717b` as text on the dark page.** It measures 4.1. Use `#9f9fa9`.
  It is fine as a border
- **Focus is authored**, never the browser default

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

One rule for the build: the command in the panel wraps like the app's. Its
parts never split: `sudo play`, then each flag with its value, such as
`--mood debugging`. A continued line is indented two columns, as in the app.
Changed 2026-10-11 in review: the first build wrapped word by word, which let a
flag end a line. The app also ends a broken line with a dim backslash; the
site leaves it out, because knowing where a line broke takes a script.

## Motion: none

Decided 2026-10-11. Nothing moves, Home included. The site is for reading, and
the app's icon is still. A bounce of the Home bars on load was offered and
declined.

## How the shell is built

Decided 2026-10-11.

- **One script, the consent banner.** The Copy button was the site's first
  script, and it went with the code block on 2026-10-12. The banner script
  from phase 5 follows the same rules: our own, inline, no request. It also
  wires Analytics settings in the footer, because one script with no shared
  chunk is what Astro inlines. A build without a measurement ID has no script
  at all
- **No syntax colours.** Astro's Shiki highlighting is off. All code is set
  in `--fg`. Green never decorates. Changed 2026-10-12: keys and comments were
  to be in `--fg-muted`, but with highlighting off nothing marks a key or a
  comment, and telling them apart takes a tokeniser for every language. If
  phase 3's examples carry comments that should recede, mute comments alone
- **All six routes exist from phase 2, as placeholders.** Each one shows a
  visible Placeholder label and carries a marker that a phase 3 test can
  forbid, so placeholder text cannot ship by accident
- **Accessibility is tested with axe** through `@axe-core/playwright`, a dev
  dependency that runs inside the test browser and makes no request. It checks
  every page in light and dark, beside the hand written checks for landmarks,
  one `h1`, focus, token contrast and the 320px width
