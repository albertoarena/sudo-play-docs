# sudo-play-docs

The documentation site for [Sudo Play](https://github.com/albertoarena/sudo-play),
a macOS menu bar app that suggests today's Spotify playlist for the mood you are
coding in.

Lives at **https://sudoplay.dev**.

## Status

Early. The site is not built yet. `placeholder/index.html` is a single static
page, with no build step and no third party request, so the domain serves
something while the real site is written.

`docs/SCOPE.md` is the plan: what is decided, what is deliberately excluded,
and what is still open.

## Layout

```
placeholder/   a single static page, no build, no external requests
docs/          the plan for this repository
```

## The one rule worth knowing before contributing

Nothing Google-related, and no third party request of any kind, enters a page
before the visitor has explicitly accepted. That is stricter than the usual
Consent Mode setup and it constrains the design, not just the analytics: no
font from a CDN, no iframe demo, no search widget that calls home on load.
`docs/SCOPE.md` explains why.
