# Checklist: sentence-level clarity pass

Loosely based on ASD-STE100 Simplified Technical English. It is not full STE,
because a page is allowed a turn of phrase, but it keeps STE's bias toward one
idea per sentence. The site is in English only, and many developers read
English as a second language. **A sentence that is grammatical and still needs
a second read to parse is a defect**, the same way a wrong claim about the app
is a defect.

This pass is narrower than the conventions in [`AGENTS.md`](../AGENTS.md),
which decide voice and punctuation. This checklist decides whether one sentence
can be read once.

**When it runs.** On every new page, and on every copy change before it goes to
Alberto for approval. It comes after the `humanizer` pass, because a rewrite
that removes AI tells can join two sentences into one, and this pass is what
splits them again.

**Walking the list is the step. Having read it is not.** A sentence that felt
clear while it was typed is exactly the one that reads twice, so the list
catches things in finished copy that it does not prevent while the copy is
being written. Go through it item by item, on the built page.

## Look for, and split or rewrite

- [ ] **A word repeated in the same sentence without reason.** "Like any web
      server, the server that hosts this site". Repetition like this reads as a
      typo, not emphasis.
- [ ] **Circular phrasing**, where the second half restates the first in other
      words and adds nothing. "The pick is fixed for the day, so it does not
      change until tomorrow."
- [ ] **Redundant synonym pairs.** "removed and deleted", "allowed and let
      through". Pick one and delete the other.
- [ ] **Stacked negatives.** "It never asks, and nothing stops it either." Two
      negated clauses in one sentence make the reader hold both at once.
      Rewrite each as a single negative, or as a positive.
- [ ] **A contrast bundled with a trailing clause.** "It is not X, it is Y:
      which is why Z." Each half of the contrast gets a sentence, and the
      explanation gets its own.
- [ ] **Elliptical fragments that borrow words from the sentence before.**
      "Never contacted otherwise." Say who is not contacted, and when.
- [ ] **A gerund clause smuggling in a second fact.** "The app opens Spotify,
      having started it first." Two facts, two sentences.
- [ ] **A pronoun whose referent is more than one noun away.** The app, the
      catalog, the playlist, the server and the setting can all be "it". When
      more than one could be meant, name the one that is.
- [ ] **Two mechanisms in one sentence.** The commonest defect, and the hardest
      to see while writing. If a sentence names a setting and a permission and
      says what each does, it is two sentences.

## What this pass must not touch

- [ ] **A number, a version, a date or a name.** `PHP 8.4`, `14 months`,
      `Article 6(1)(a)`, the "Last updated" date, the contact address. This is
      a wording pass. If a split seems to need a claim softened or a figure
      rounded, the split is wrong.
- [ ] **Anything inside `<code>` or a `pre` block**, and the tagline in the
      Home panel, `$ sudo play --genre rock --mood debugging`. They are not
      prose and do not get simplified.
- [ ] **A word the app shows.** Mood and genre names, button labels such as
      Play, Next and Surprise me, and the names of settings must match the
      app, which is authoritative. They change when the app changes, not in a
      wording pass.
- [ ] **The text of `releaseNote()`.** It lives in `src/data/release.ts`, and
      a test forbids stating the release anywhere else. Changing it is a code
      change with a test, not a wording pass.
- [ ] **The bold lead-in on a list item**, such as "Hear when it ships." on
      Install. It is the action the reader takes. A split keeps it on the same
      words.
- [ ] **Someone else's words.** Licence texts, such as `OFL.txt`, and any
      quotation stay verbatim, dashes included.

## How to check a pass did not change a claim

A wording pass is easy to get wrong in one specific way: a rewrite quietly
drops a link, rounds a figure, or loses a name. That is hard to see in a diff of
seven pages.

The check is mechanical. Build the site before and after, and pull every link
target, every `<code>` span and every number out of each page's main content.
Compare the two sets. **Nothing should be lost.** Additions are expected and
usually a good sign: this pass replaces a vague pronoun with the thing it refers
to, so a name appears where "it" used to be.

Compare the built HTML, not the `.astro` source. A line break in the source can
fall inside a phrase, and the built page is what the reader gets.

**Re-wrap only the paragraphs the branch actually changed.** Re-wrapping one
that `main` already had adds churn to the review and hides the sentences that
moved. Compare each paragraph against the merge base with its whitespace
collapsed, and leave the ones that match alone.

## Scope

This is a wording pass, not a claim change. It does not need the app checked
again, with one exception: **if the rewrite changes what a sentence says about
the app or about this site's data, it is not a wording pass any more.** Stop,
and check the claim the way it was checked the first time: against the app at
`checkedAt` in `src/data/release.ts`, for moods and genres against the
catalog on `catalog-live`, or, for Privacy, against
`src/scripts/consent.ts`, `src/scripts/analytics.ts` and their tests. A change
to what Privacy says also moves its "Last updated" date.
