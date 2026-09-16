# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Internal staff at a Quebec-based healthcare facility network — nurses,
doctors, pharmacists, receptionists, administrative and security personnel,
cashiers, and general/regular employees (the eight roles recorded on
`Employee.role`). They use the system during normal admin/clinical-support
work: looking up a patient's record, checking who's scheduled where, logging
an infection or vaccination, managing facility capacity. Not a
patient-facing product — patients are records staff manage, not users of the
app.

## Product Purpose

A Healthcare Management System (HMS) for tracking patients, staff,
facilities, schedules, infections, and vaccinations across a small network
of hospitals, clinics, CLSCs, and pharmacies (11 facilities, ~447 patients,
~303 employees, ~9,147 shifts in the current dataset). Success is a staff
member finding, adding, or updating the right record quickly and correctly,
with every write attributable to who made it.

## Positioning

Not a commercial product competing for a market — this is a full-stack
engineering portfolio piece (confirmed in this project's own engineering
notes, e.g. `notes/private/AUDIT_2026-08-18.md`: "for a portfolio repo,"
written to be read by a technical interviewer). Its differentiator isn't a
pitch, it's demonstrated engineering judgment: real RBAC, audit logging,
soft deletes, PII-aware URL design, and — following this redesign — visual
craft that doesn't read as an AI-generated template. The redesign should
make the software look and feel like something a real hospital network
would actually run, specific to healthcare operations, not generic
SaaS-dashboard styling.

## Operating Context

Desktop-first internal tool, verified responsive down to a 390px mobile
viewport as of the 2026-09-16 redesign (live-checked, not just assumed —
see the dated note in `notes/` for that pass). Staff authenticate via JWT; any
authenticated account reads, only `is_staff` accounts write (coarse RBAC —
role-specific permissions are a deliberate future pass, not built yet).
Every write is audit-logged. Records use soft delete. URLs use an opaque
per-person UUID — SSN and Medicare (the real join key and declared primary
key) must never appear in a URL, a standing project invariant (`CLAUDE.md`).

## Capabilities and Constraints

- Manage: Persons (patients), Employees, Facilities, Residences, Infections,
  Vaccinations, Employments, Schedules.
- Eight employee roles: nurse, doctor, pharmacist, receptionist,
  administrative personnel, security personnel, cashier, regular employee.
- Five facility types: Hospital, CLSC, Clinic, Pharmacy, Special
  installment.
- Dashboard analytics: role/type distributions, age buckets, vaccination
  trend, top facilities by capacity/occupancy.
- Constraint: raw SSN has been removed from every visible UI surface as of
  2026-09-16 (list columns, detail fields, dropdown option labels — replaced
  with an opaque `NO. XXXXXXXX` reference derived from `Person.uuid`, same
  as the existing card pattern). Medicare display wasn't part of this pass
  and hasn't been separately re-verified. The broader policy question —
  whether SSN belongs on any browse/list surface at all, vs. only a gated
  detail view — is still open; see `todo/strategic_roadmap_todo.md` §3.
- Constraint: the schema is a legacy MySQL database (`managed = False`
  Django models). This redesign is frontend-only and must not imply or
  require schema changes.

## Brand Commitments

Name stays fixed: "HMS" / "Healthcare Management System" (user confirmed
2026-09-10). The original Tailwind/Heroicons look and blue/indigo palette
have since been replaced entirely, across two full design passes — first
"Admission & Intake" (teal/paper/stamp), then "Access & Roster" (the
current system, a staff ID-badge metaphor; see `DESIGN.md`). Both replaced
an implementation the user directly called anti-reference: "this look
like copilot work" — a generic AI-template SaaS dashboard, not something
built for healthcare operations.

## Evidence on Hand

Real (synthetic but realistic) seed data: Montreal/Westmount, QC addresses
and facility names (Hôpital de Verdun, CLSC Sainte-Catherine, Jean Coutu
Pharmacy, etc.), plausible patient/employee names, SSNs, Medicare numbers,
and vaccination/infection records dated through 2024. No product
screenshots, press, testimonials, or case studies exist or should be
fabricated — this is not a marketing surface.

## Product Principles

1. Staff can find and act on the right record fast — scanability and
   information density outrank decorative flourish (Operate mode, not
   Persuade).
2. The visual language reads as healthcare-specific, not generic SaaS —
   avoid the AI-template tells already caught this session (gradient
   text/buttons, decorative purple-in-a-rainbow-row stat cards, icon-tile
   stacked above a heading).
3. Every interactive control is genuinely operable by keyboard and screen
   reader, not just visually present (binding — see Accessibility below).
4. This redesign changes the look, not the function — preserve all existing
   routes, data, and behavior.
5. Sensitive data (SSN, Medicare) gets no less careful visual treatment than
   today, and ideally more.

## Accessibility & Inclusion

Binding requirement (user confirmed 2026-09-10): the redesign must meet
WCAG AA — real color contrast, full keyboard operability (including the
current hover-only nav dropdowns, which must become keyboard-accessible),
and correct screen-reader labeling (search/filter inputs currently have
visually-only labels with no programmatic association). Full list of
already-verified current gaps: `todo/ux_accessibility_todo.md`. This is a
floor for the new design, not a follow-up pass.
