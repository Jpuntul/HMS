# Access & Roster design rollout — 2026-09-16

Builds on `DESIGN.md`'s pilot-stage snapshot (Login, Dashboard, Person
Management only) and the still-open gaps it listed. This note closes that
pilot out: full app-wide rollout, plus several structural/data-exposure
fixes found and fixed from direct user testing on the live app.

## Why

The prior "Admission & Intake" visual system (teal/paper/stamp) was
discarded mid-project after direct user feedback ("looks like Notion",
"not professional") and replaced with "Access & Roster" — a staff
ID-badge metaphor chosen via `impeccable`'s `concept-seed` tool weighed
against six dealt catalog challengers (full reasoning in the direction
contract: `.impeccable/surfaces/front-src-pages-auth-login-tsx.md`). That
replacement shipped as a three-surface pilot first. This pass finished the
rollout to every remaining entity and fixed real bugs surfaced by using
the live app on a real (narrow) viewport, rather than only at desktop
width.

## What changed

**Design system.** `front/src/index.css` now documents "Access & Roster":
Space Grotesk (labels/names) + Space Mono (IDs, dates, counts — data only,
never decorative), a single committed light theme (no dark-mode flip —
an earlier draft flipped dark on OS preference and read as "too strong"),
and two reusable classes: `.badge-tag` (solid reversed-color tag for
role/status — replaces an earlier colored-stripe-on-card treatment that
turned out to be exactly the generic pattern this project's own craft
floor bans) and `.badge-card` (bordered panel with a decorative
punch-hole notch, reserved for actual badge-shaped objects — list/table
panels use a plain bordered `.badge-account`/bordered-div style instead,
no notch).

**App shell** (`front/src/App.tsx`). A full-width topbar (sidebar-collapse
toggle, wordmark, section title, date) sits above a row of
`[collapsible sidebar | content]`. Two fixes landed here from live mobile
testing:

- The sidebar/content row didn't stack on narrow viewports at first —
  fixed with `flex-col md:flex-row`, and the sidebar now defaults to
  collapsed under 768px so content isn't buried below a full nav list on
  first load.
- The sidebar's nav list and its footer (a "Register User" action button,
  deliberately kept out of the nav list itself since it's an action, not
  a destination — plus the signed-in user's own account card) originally
  shared one scroll region. On a short viewport the footer could scroll
  out of view along with the nav. Fixed by giving the nav its own
  `flex-1 overflow-y-auto` and keeping the footer `flex-none`: the nav
  scrolls internally if it's ever too tall, the footer is always fully
  visible at the bottom, regardless of viewport height or how long the
  nav list is.

**Full entity rollout.** Every remaining surface was brought onto the new
system: Employee, Facility, Schedule, Infection, Vaccination (list,
card/table, Add, Edit, Detail for each), plus `AddPerson.tsx`,
`EditPerson.tsx`, `PersonDetail.tsx`, and the shared
`DeleteConfirmationModal.tsx` — all four of which `DESIGN.md`'s prior
version listed as "genuinely missed" gaps from the original parallel
rollout. Role/status now render consistently as `.badge-tag` everywhere,
using one shared role→abbreviation/color mapping
(`front/src/utils/roleMeta.ts`) instead of each page inventing its own —
an earlier duplicate copy on `ScheduleCard.tsx` had actually drifted from
the canonical one (a different color for "receptionist"), caught and
fixed during this pass.

**SSN display removed** from every visible spot it appeared in Infection
and Vaccination (list table columns, detail-page subtitles and fields,
the person-picker dropdown's option labels on Add/Edit) and from the
Employee entity's own person-picker dropdown. Replaced with the same
`NO. XXXXXXXX` reference-ID pattern (an 8-char uppercase slice of
`person_uuid`) already used on Person/Employee cards. The underlying
`ssn` value in form state and API request payloads is untouched — the
backend genuinely needs it to identify the record for these composite-key
entities; only the rendered UI changed. This closes the specific
dropdown-SSN instance already flagged in
`todo/strategic_roadmap_todo.md` §3, but **not** the broader SSN/Medicare
masking policy question that item is actually about (see "What's NOT in
this pass").

**Mobile table overflow.** Table wrapper `<div>`s in `InfectionList.tsx`
and `VaccinationList.tsx` used `overflow-hidden`, which clips columns
that don't fit rather than letting them scroll into view — on a narrow
viewport the Date/Actions columns were simply unreachable. Changed to
`overflow-x-auto` (the pattern every other page's table wrapper already
used).

**Dashboard "Staff by Role" cards** switched from `flex flex-wrap` to
`grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))]` so every role card
is the same width regardless of label length ("Administrative Personnel"
vs. "Nurse") — the flex version produced visibly uneven card widths, a
real user-reported readability issue.

## What's NOT in this pass

- **The SSN/Medicare masking policy decision itself**
  (`todo/strategic_roadmap_todo.md` §3) — whether SSN/Medicare should
  render at all on browse/list views versus only a gated detail view.
  This pass removed opportunistic display instances that had no reasoning
  behind them; it did not decide the underlying policy question, which is
  still explicitly open.
- **`Dropdown`'s missing search/filter** for large option lists (e.g. 303
  employees) — still the case, tracked in `todo/ux_accessibility_todo.md`
  §2.
- **No comp-led visual round.** No image generation was available in this
  environment for most of this work; the Figma MCP that was connected
  mid-session hit its plan's tool-call rate limit before producing usable
  frames, so the direction was iterated as a live HTML artifact with the
  user instead, then implemented directly. Code-led by circumstance, not
  a workflow choice.
- **A full WCAG contrast audit** across the new palette is still only
  spot-checked, not exhaustively measured (carried over from the prior
  pilot-stage note, still true).

## Verification

Live browser verification (Playwright, both ~1440px desktop and 390px
mobile widths, with real seed data and a real authenticated session) was
performed earlier in this same working session for essentially everything
described above: the app shell at both widths and multiple viewport
heights down to 480px (confirming the footer/nav split), every restyled
entity's list/detail/add/edit pages, the Infection/Vaccination mobile
scroll fix (confirmed the Date/Actions columns are actually reachable by
scrolling, not just that the CSS property changed), the SSN removal
(confirmed no raw SSN renders anywhere in the affected files, including
inside the person-picker dropdowns), and the Dashboard role-card grid.
`npx tsc --noEmit` and `npm run lint` were run clean after each change.

This note itself was written from a static read of the resulting source
files (`front/src/index.css`, `front/src/App.tsx`, and representative
page files under `front/src/pages/`) to confirm the code matches what's
described above — it did not re-run the live browser checks; those are
reported based on what actually happened earlier in the same session, not
independently re-verified here.
