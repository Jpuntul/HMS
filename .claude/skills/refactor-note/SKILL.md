---
name: refactor-note
description: Write a dated note in notes/ documenting a completed refactor, security fix, or feature pass in this repo's established house format (why / what changed / what's NOT in this pass / verification), and add it to notes/INDEX.md. Use after finishing non-trivial work here - not for small one-line fixes.
---

# refactor-note

Recommended in `notes/AUDIT_2026-08-18.md` §7.2 as the one skill worth
building for this repo: it automates a habit that's already been
demonstrated by hand across a dozen dated notes, rather than inventing a
new process. The value of the format isn't the decision it records — it's
the _rejected alternatives and the reasoning_, which evaporates from memory
in a month and can't be recovered from a diff.

## When to use this

After finishing something that changed behavior, closed a security gap,
touched the data model, or made a real tradeoff — not after a typo fix or
a one-line config change with the reasoning already inline in a code
comment (see how `ACCESS_TOKEN_LIFETIME`'s change was handled: comment in
`settings.py`, no separate note — judgment call, not a rule to automate
away).

## What to do

1. **Determine scope.** Look at what's staged/committed since the note-worthy
   work started (`git diff`, `git log`). If genuinely unclear what the note
   should cover, ask — don't guess at scope for something that will outlive
   this session.

2. **Pick a filename and location**: `<TOPIC_IN_CAPS>_<YYYY-MM-DD>.md`. Match
   the date to when the work actually happened, not necessarily "today" if
   writing this up after the fact. Check both `notes/` and `notes/private/`
   for naming collisions on the same date.

   `notes/` is published by default (tracked in git, no gitignore
   maintenance needed). Write there unless the note describes something
   that genuinely shouldn't be public yet — a draft, or a finding that's
   still open/unresolved rather than closed as done-or-declined (see
   `notes/INDEX.md`'s "Publishing scope" for the exact criterion). In that
   case, use `notes/private/` instead — gitignored wholesale, no per-file
   entry needed either way. Default to public; use private deliberately,
   not the other way around.

3. **Write the note** in this exact structure — it's load-bearing, not
   decorative:

   ```markdown
   # <Title> — <YYYY-MM-DD>

   <One-line framing: which prior note or roadmap item this builds on,
   with a relative link.>

   ## Why

   <The problem, grounded in something specific - a finding, a prior
   note's deferred item, a bug. Not "best practice" as a reason on its
   own.>

   ## What changed

   <Per file or per concern, not a diff dump. Explain _why_ a choice was
   made where there was a real fork, not just what the code now does -
   the code already says what; the note's job is why.>

   ## What's NOT in this pass

   <Deliberately deferred items, named explicitly, with why. This section
   is not optional - an ADR/note with only upsides wasn't examined
   honestly. If genuinely nothing was deferred, say so rather than
   omitting the section.>

   ## Verification

   <A table or list of what was actually checked and its result - ideally
   against a live server/real data, not just "tests pass." State
   assumptions as assumptions ("assumed," "predicted, not yet verified")
   rather than asserting them as fact.>
   ```

4. **Cross-link, don't duplicate — but only within the same visibility.**
   A relative markdown link (`[FOO.md](FOO.md)`) is safe between two notes
   in `notes/` or two notes in `notes/private/`. A note in `notes/` must
   **never** link to one in `notes/private/` — that's a dead link the
   moment someone without local disk access reads it. Reference a private
   note by plain-text mention instead (name, date, no brackets) if you
   need to cite it from a published one. Never edit an older note to
   reflect new information - old notes are historical; supersession is
   recorded in `INDEX.md`, not by rewriting the original.

5. **Update `notes/INDEX.md`** — only if the note landed in `notes/`. A
   note written to `notes/private/` doesn't get an index entry (the index
   describes what's published). Add a row under the right category table
   (Security & auth / Deployment & dependencies — add a new category only
   if neither fits). If this note closes an item a private note's "Open
   decisions" section named, don't name that private note's content in the
   index (nothing there is public) — just note here, generally, that
   something closed.

6. **`notes/` is a normal `git add`; `notes/private/` never is.** The
   split is the point — `notes/` is meant to be tracked, `notes/private/`
   is gitignored wholesale. Don't add a per-file gitignore entry either
   way; the directory choice at step 2 is the only decision needed.

## What this skill does not do

Doesn't decide _whether_ something is significant enough to document -
that judgment call stays with whoever invokes it. Doesn't write ADRs for
declined work automatically either; use the same house format for those
(see `notes/DECLINED_2026-09-09.md` for the shape: Status / Context /
Decision / Alternatives considered / Consequences) when the work in
question was a "no," not a "yes."
