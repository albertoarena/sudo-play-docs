---
version: 1
slug: "src-layouts-base-astro"
primary_target: "src/layouts/Base.astro"
related_targets: ["src/components"]
---

# Surface: the sudoplay.dev page shell

Scope: the layout every page sits in (masthead, nav, main column, footer, the
terminal panel, code blocks, prose). Visitor mode: Read. The decisions and their
reasons are in `docs/DIRECTION.md`; this brief is the build contract.

Audience and job: Mac users who already found Sudo Play, there to install it,
learn the moods and check privacy. Six pages, read in order.

## Direction contract

THESIS: The popover, at page size. The app's composition (a dark terminal header
over a quiet body) becomes the site's frame. Refuses the default developer docs
costume: no mono running text, no green on black pages, no sidebar tree for six
pages.

OWN-WORLD: Zinc neutrals and one emerald, tokens in `docs/DIRECTION.md`. A dark
`--term-bg` masthead band in both modes with the app mark; nav in `--term-dim`;
the current page in `--term-green` over three tiny equaliser bars. System sans
for reading, Geist Mono only in the panel, code and small labels. Code blocks
are light in light mode; only the panel is dark.

STORY: The reader recognises the app at once, knows which page they are on, reads
a calm column, and moves on through previous and next.

FIRST VIEWPORT: Inner pages: 56px dark band (mark and name left, nav right,
wrapping under the name below about 40rem), then h1 and lead in a 66ch column.
Home: the band grows into the full panel with window dots and
`$ sudo play --genre rock --mood debugging` at display size, h1 below.

FORM: Brief-pinned world (app colours and panel), not rolled. Seed key: none,
direction pinned by the brief and approved 2026-10-11.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
