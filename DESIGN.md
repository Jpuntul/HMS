# Design

<!-- impeccable:design-schema 1 -->

## World

**Access & Roster.** Every record in HMS reads as a staff access badge —
the product's own opaque-UUID/audit-log identity system made literal —
never a generic SaaS dashboard tile. Replaces an earlier "Admission &
Intake" system (a clinical-form/paper-stamp metaphor) entirely; that world
is evidence/anti-reference now, not a base this one extends. Chosen via
`impeccable`'s `concept-seed` tool: dealt index 6 from a ranked list of
healthcare-specific structural candidates (a hospital staff ID-badge
system), weighed against six catalog challengers — none won on audience
identification for this Quebec healthcare-staff tool, but two donated
disciplines folded in (a REVEAL-on-demand interaction pattern available
for the still-open SSN/Medicare masking decision; a zebra-stripe-style
hazard treatment reserved for genuinely overdue/urgent rows). Iterated
live with the user across several rounds before and during rollout — a
first build was judged "too intermediate" (a colored accent-stripe on
cards, thin/quiet weight) and corrected to solid reversed-color tags with
real per-record ID numbers; a dark-mode flip and heavy borders were judged
"too strong" and replaced with a single committed light theme.

Direction contract (full six-block form):
`.impeccable/surfaces/front-src-pages-auth-login-tsx.md`

## Palette

Single committed light world — no dark-mode flip. A cool, unsaturated
paper/ink pairing (not the near-black-on-warm-cream this project's own
AI-slop calibration already flags as a default rendition), with role and
status color reserved entirely for `.badge-tag`, never the page's own
structural palette.

| Token                     | Value     | Use                                               |
| ------------------------- | --------- | ------------------------------------------------- |
| `--color-paper`           | `#f7f6f2` | Page ground                                       |
| `--color-panel`           | `#ffffff` | Card/panel surface                                |
| `--color-paper-line`      | `#e2e0d6` | Hairline dividers, input borders                  |
| `--color-ink`             | `#34383f` | Primary structural color — text, borders, buttons |
| `--color-ink-soft`        | `#7a7e85` | Secondary text, labels, icons                     |
| `--color-stamp-red`       | `#a8382c` | Urgent/destructive state only — never decorative  |
| `--color-verified-green`  | `#2c7350` | Confirmed/positive state only                     |
| `--color-pending-amber`   | `#9c7112` | Needs-attention state only                        |
| `--color-role-nurse`      | `#21847a` | Employee/Schedule role tag                        |
| `--color-role-doctor`     | `#2c4c82` | Employee/Schedule role tag                        |
| `--color-role-pharmacist` | `#6a4a8f` | Employee/Schedule role tag                        |
| `--color-role-admin`      | `#9c7112` | Employee/Schedule role tag                        |
| `--color-role-security`   | `#4a4e56` | Employee/Schedule role tag                        |
| `--color-role-cashier`    | `#6a7a2e` | Employee/Schedule role tag                        |
| `--color-role-regular`    | `#62666d` | Employee/Schedule role tag                        |

**Color is earned, never decorative.** Role colors are categorical
(one fixed color per role, not a rotation), centralized in one place —
`front/src/utils/roleMeta.ts` maps each `Employee.role` string to an
abbreviation (`RN`, `MD`, `ADM`, …) and a color, so Employee and Schedule
surfaces render the same role identically instead of each page inventing
its own mapping (an earlier duplicate on `ScheduleCard.tsx` had actually
drifted — a different color for "receptionist" — caught and fixed).
Status color (urgent/verified/pending) only appears when a real,
named threshold is crossed — documented inline at each call site, not
asserted here.

## Type

- **Labels, names, UI chrome**: Space Grotesk (400/500/700) — a workhorse
  grotesk with more character than the training-data-default choice
  (Inter), used with restraint befitting an Operate-mode tool.
- **IDs, dates, counts — data only, never decorative**: Space Mono
  (400/700), `--font-mono`. Reserved for genuine tabular/measurement data
  (a badge reference number, a date, a record count) — never used as a
  costume for "looks technical."
- Tabular numerals on by default (`font-feature-settings: "tnum" 1` on
  `body`).

## Components

- **`.badge-tag`** (`front/src/index.css`) — the sole way role and status
  render anywhere in the app: a solid reversed-color tag (`background`
  set per-call-site, text always `--color-paper`), small radius, Space
  Mono, bold. Never a colored side-stripe and never a tinted/pastel pill —
  both are banned generic patterns for this system (an early build used a
  colored accent-stripe on cards and was corrected specifically because of
  this). `StatusStamp.tsx` and `roleMeta.ts` are the two call sites that
  produce the `background` color for this class; nothing else should
  invent a third status-color convention.
- **`.badge-card`** (`front/src/index.css`) — a bordered, rounded panel
  with a decorative punch-hole notch (`::before`), reserved for genuinely
  badge-shaped objects: single-record Detail/Add/Edit panels, and small
  roster/staff-badge chips. List/table panels (a page's header block, a
  stats row, a table wrapper) use a plain `rounded border-[1.5px]
border-ink bg-panel` instead — no notch; a wide list panel isn't a
  "badge" the way a compact card is.
- **`.badge-account`** (`front/src/index.css`) — same border/radius/
  background as `.badge-card`, deliberately without the punch-hole notch.
  Used only for the sidebar's own account-card footer, which is a
  full-height structural element of the shell, not a discrete card.
- **`StatusStamp`** (`front/src/components/StatusStamp.tsx`) — thin
  wrapper that renders `.badge-tag` with a tone-to-color mapping
  (`urgent`/`verified`/`pending`). Kept as a component (rather than
  inlining `.badge-tag` everywhere) purely so every caller shares one
  tone vocabulary.
- **`FormCheck`** (`front/src/components/FormCheck.tsx`) — a real square
  checkbox with a drawn check, unchanged from the prior system; visually
  neutral and compatible with the new tokens without modification.
- **`Dropdown`** (`front/src/components/Dropdown.tsx`) — custom
  ARIA-listbox replacing every native `<select>` app-wide. Known gap: no
  search/filter for large option lists (e.g. 303 employees) — see "What's
  NOT in this pass."
- **App shell** (`front/src/App.tsx`, `AppShell` component) — a
  full-width topbar (sidebar-collapse toggle, "HMS" wordmark, current
  section title, today's date) above a row of `[collapsible sidebar |
page content]`. The sidebar's nav list is `flex-1 overflow-y-auto`
  (scrolls internally if ever too tall for the viewport); a
  "Register User" action button and the signed-in user's own
  `.badge-account` card sit below it as a `flex-none` footer, always
  fully visible at the bottom regardless of nav length or viewport
  height — verified live down to a 480px-tall viewport. "Register User"
  is deliberately outside the main nav list: it's an action (create a
  user), not a destination to view, so it doesn't read as one more page
  among Dashboard/Patients/etc. Below the `md:` breakpoint the sidebar
  stacks above content instead of beside it, and defaults to collapsed on
  first load so content isn't buried under a full nav list.
- **Buttons**: solid `bg-ink` primary, `rounded border-[1.5px]
border-ink`, flat (no shadow) with `transition-colors` on hover.
  Destructive actions use `stamp-red` outline-to-fill on hover, never a
  filled red by default.

## Motion

One authored entrance moment (`@keyframes panel-rise` in `index.css`) on
primary focal panels (Login) — exponential ease-out from an
already-visible default, respects `prefers-reduced-motion`. Everything
else is `transition-colors` on interactive states — no scattered
per-section entrance effects. The sidebar's collapse/expand also
transitions (`width`/`opacity`/`border-color`), matching the same
restrained-motion discipline.

## Accessibility

Binding requirement (PRODUCT.md), not a follow-up pass. Carried forward
from the prior pass: nav interactions are real keyboard-operable
disclosures; `SearchBar`/`FilterDropdown` labels are programmatically
associated (`htmlFor`/`id`); loading skeletons carry `role="status"`/
`aria-live="polite"`. `DeleteConfirmationModal`'s focus-trap/Escape/
`role="alertdialog"` behavior was already correct before this pass and
was left untouched — only its visual chrome was brought onto the current
tokens. Not yet done: a full WCAG contrast audit across the current
palette (spot-checked only).

## Scope built so far

**Complete app-wide, as of 2026-09-16.** Every entity is on the current
system: Login, Register, Home, Dashboard, Patients (Person), Staff
(Employee), Facilities, Schedules, Infections, Vaccinations — list,
card/table, Add, Edit, and Detail views for each, plus the shared
`DeleteConfirmationModal`. There is no known remaining unmigrated surface.
Full history: `notes/ACCESS_ROSTER_ROLLOUT_2026-09-16.md` (this pass) and
`notes/TODO_CHECKLIST_PASS_2026-09-10.md` (the backend/frontend
performance pass that preceded it).

## What's NOT in this pass

- **SSN/Medicare masking policy** — whether these identifiers should
  render at all on browse/list views versus only a gated detail view.
  This and the prior pass removed opportunistic raw-SSN display instances
  that had no reasoning behind them (Infection, Vaccination, and the
  Employee/Schedule person-picker dropdowns all now show a `NO. XXXXXXXX`
  reference ID instead), but the underlying policy decision is still open
  — `todo/strategic_roadmap_todo.md` §3.
- **`Dropdown` has no search/filter** for large option lists (e.g. 303
  employees) — a real usability regression versus the native `<select>`
  it replaced. `todo/ux_accessibility_todo.md` §2.
- **No comp-led visual round.** Image generation wasn't available for
  most of this work; a Figma MCP connection made mid-project hit its
  plan's tool-call rate limit before producing usable frames, so the
  direction was iterated as a live HTML artifact with the user instead,
  then implemented directly. Code-led by circumstance, not a workflow
  choice — no `.impeccable/mocks/` exist for this direction.
- **A full WCAG contrast audit** across the current palette — spot-checked
  during rollout, not exhaustively measured.
- The critical UUID/MySQL lookup bug found during the prior pass's UX
  review is fixed (`DashedUUIDField` in `back/hms/models.py`,
  `todo/strategic_roadmap_todo.md` Priority 0) — noted here only because
  an earlier version of this file listed it as outstanding.
