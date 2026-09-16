# Todo Checklist Pass — 2026-09-10

Closes out `todo/backend_performance_todo.md` and `todo/frontend_performance_todo.md`
(both gitignored working files, not tracked — see `CLAUDE.md`'s `notes/` split for why this
summary lives here instead). Those two files were themselves generated from a 2026-09-09
reference review and then verified against the live codebase before any of this started.

## Why

The reference review produced two checklists of concrete performance/scaling items. Verifying
them against the actual code turned up one item already done (chart container heights) and
several whose premise needed live confirmation rather than trust (duplicate indexes, the
Schedules scan) before touching schema. Implementation was then split into two independent,
disjoint-file passes (backend: `back/hms/*`, `Dockerfile`; frontend: `front/src/*`,
`vite.config.ts`) run as separate agents under one constraint: don't guess on anything
uncertain — implement what's mechanical, and leave anything needing a judgment call open with
the exact decision named, rather than picking a default.

## What changed

**Backend** (`back/hms/settings.py`, `back/hms/views.py`, `back/hms/serializers.py`,
`back/hms/analytics.py`, `Dockerfile`):

- `CONN_MAX_AGE`/`CONN_HEALTH_CHECKS` added to `DATABASES["default"]`; Gunicorn switched to
  `--worker-class gthread --threads ${GUNICORN_THREADS:-4}` in the Dockerfile.
- `dashboard_stats` (`analytics.py`) cut from 10 sequential queries to 6 — count/capacity
  pairs that share a table were folded into one `aggregate()` call each
  (`person_stats`/`facility_stats`); `citizenship_distribution`/`province_distribution` stay
  separate on purpose, since they're on different tables and a UNION would trade a small query
  count for real fragility at this row count.
- `person_filter_options`/`employee_filter_options` wrapped in `@cache_page(60 * 60)` — safe
  to share across all callers since both return the same reference data (distinct
  citizenships/occupations/roles) regardless of who's asking.
- `AuditLogMixin.perform_create`/`perform_update`/`perform_destroy` wrapped in
  `transaction.atomic()`, so a write and its audit row commit or fail together.
- Six `SerializerMethodField` name concatenations (`EmployeeSerializer.person_name`,
  `FacilitySerializer.general_manager_name`, and four more) replaced with a SQL `Concat`
  annotation via a shared `_full_name()` helper. Kept the `SerializerMethodField` wrapper
  rather than switching to a plain `CharField`: tested first, and a plain field silently
  vanishes from create/update responses (DRF `SkipField`s a read-only field with no matching
  attribute, since `serializer.instance` after `perform_create`/`perform_update` was never
  pulled through the annotated queryset). Each method now reads the annotation when present
  and falls back to the original Python concatenation when absent.
- **`Schedules` composite index applied to the live DB**:
  `ALTER TABLE Schedules ADD INDEX idx_schedules_deleted_date (DeletedAt, Date, StartTime)`.
  `EXPLAIN` before: `type=ALL, rows=9147, Using where; Using filesort`. After: `type=ref,
key=idx_schedules_deleted_date, rows=4573, Using index condition` — filesort gone.
- **Two duplicate indexes dropped from the live DB**: `ALTER TABLE Persons DROP INDEX
Medicare` and `ALTER TABLE Employees DROP INDEX SSN` — both columns were already covered by
  `PRIMARY`, so the second unique index on each was pure redundancy.
- **`ScheduleListCreateView`'s dead search fixed**, now that the index above made it cheap to:
  it had no `SearchFilter` at all, so the frontend's `?search=`/`?role=` params were silently
  dropped and the full 9,147-row table came back regardless of the term. Added `SearchFilter`
  with a narrow `search_fields` (employee name only — not facility/role/free text, to keep the
  join side cheap), plus a `ScheduleFilterSet` mapping `?role=` to `employee__role` (django-filter's
  plain `filterset_fields` can't rename a traversed field's query param, so a custom `FilterSet`
  class was needed).

**Frontend** (`front/src/App.tsx`, `AuthContext.tsx`, `SearchBar.tsx`, `Dashboard.tsx`, all six
list pages, `vite.config.ts`):

- Route-level code splitting (`App.tsx`): every page component is now `React.lazy`, wrapped in
  one `<Suspense fallback={<RouteLoader />}>`.
- Manual vendor chunk splitting (`vite.config.ts`): `vendor-react`, `vendor-charts`,
  `vendor-icons` split out of the main bundle.
- Double-fetch race condition and stale-response overwrites fixed on **all six** list pages
  (`PersonList`, `EmployeeList`, `ScheduleList`, `FacilityList`, `InfectionList`,
  `VaccinationList`) — not just the three the todo named, since the other three had the
  identical bug. Page reset now happens synchronously in the filter/search change handler
  instead of a second `useEffect` reacting to the same state change; an `AbortController`
  cancels a still-in-flight request when a newer one starts.
- `AuthContext`: `login`/`logout`/`register` wrapped in `useCallback`, the provider `value` in
  `useMemo`.
- `setTimeout` leak fixed on all six list pages via a ref-tracked timer with unmount cleanup.
- `SearchBar` now owns its own debounce internally (local `useState` + the existing
  `useDebounce` hook) instead of every parent list page debouncing separately — a keystroke
  re-renders only the search input, not the whole card grid. The three consumers
  (`PersonList`, `EmployeeList`, `FacilityList`) had their now-redundant per-page
  `useDebounce(searchTerm, 500)` removed; keeping both would have meant a 1000ms double-debounce.
- Skeleton loading screens (`components/Skeleton.tsx`: `SkeletonCards`, `SkeletonTableRows`)
  replace the bare "Loading..." text on all six list pages.
- `React.memo`-wrapped card components extracted for the four card-grid pages (`PersonCard`,
  `EmployeeCard`, `ScheduleCard`, `FacilityCard`); each parent's `handleDeleteClick` is now
  `useCallback`-wrapped too, since a new function identity on every parent render would have
  defeated the memoization. `InfectionList`/`VaccinationList` render tables, not card grids, so
  out of scope.
- `Dashboard.tsx` metric/chart-data calculations moved from after the loading/error early
  returns to before them (illegal otherwise — hooks must run unconditionally, same order every
  render) and wrapped in `useMemo` with null-safe fallbacks.

## Decisions made this pass (all with a cited reason, not defaults)

- **Redis: declined, not deferred.** `notes/private/SYSTEM_DESIGN_METHOD.md`'s trigger table
  names Redis's condition explicitly — "same expensive read repeats, costing >100ms of DB work
  per request, or state shared across >1 process" — and states plainly it hasn't fired at this
  scale (single-digit-ms queries, one process). Nothing in this pass changed that; the queries
  that existed got faster, not slower. Revisit only if that trigger actually fires.
- **FULLTEXT search modernization: declined, same reasoning.** The same note gates a
  search-engine/FULLTEXT upgrade at "roughly past 10⁵–10⁶ rows"; the largest table here
  (`Schedules`) is 9,147 rows, about two orders of magnitude below that. `LIKE` stays correct
  at this size.
- **`.only()`/`.defer()` for "heavy models": not applicable, item removed.** Checked every
  model in `back/hms/models.py` — no `TextField`/`BinaryField`/JSON column exists anywhere in
  this schema; everything is short scalar columns. There is nothing for column-restriction to
  meaningfully defer.
- **Client-side data caching (TanStack Query / SWR): declined for now, library choice resolved
  but the item itself deferred.** The actual bug this app had — a slow earlier response
  overwriting a newer one — is already fixed via the `AbortController` work above, without a
  new dependency. What remains is "instant tab-switching" polish on six list pages that are
  still ~400–550 lines of near-duplicated fetch/paginate/filter logic each. Wiring a caching
  layer into that duplication now means doing it six times; the shared list-page shell (next
  item) should land first so it only has to happen once.

## What's NOT in this pass

- **Shared list-page shell** (`todo/frontend_performance_todo.md` §3) — the six list pages
  remain near-identical, ~400–550 lines each. Explicitly left alone: it reshapes files every
  other item in this pass also touched, so doing it concurrently risked compounding merge
  conflicts across two parallel agents. Real architecture decision, not a mechanical fix — next
  candidate for a dedicated pass.
- **Redis, FULLTEXT search, `.only()`/`.defer()`, TanStack/SWR** — see "Decisions made this
  pass" above; each has a specific named reason, not a placeholder.
- No commits were made as part of this pass. Everything above is sitting in the working tree
  for review.

## Verification

| Check                                                          | Result                                                                                                                      |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `manage.py check`                                              | Clean, 0 issues, after every backend change including the schema DDL                                                        |
| `manage.py check_schema_sync`                                  | 10/10 tables in sync                                                                                                        |
| `EXPLAIN` on the Schedules pagination query, before/after      | `type=ALL, rows=9147, filesort` → `type=ref, key=idx_schedules_deleted_date, rows=4573, no filesort`                        |
| `SHOW INDEX FROM Persons` / `Employees`, before/after          | Duplicate `Medicare`/`SSN` unique indexes confirmed present, then confirmed gone; `PRIMARY` and every other index untouched |
| Row counts, before/after the DDL                               | Schedules 9,147 / Persons 447 / Employees 303 — unchanged, confirming no data was touched                                   |
| `ScheduleListCreateView` search/role filter, live queryset     | `?search=zzzznomatch` → 0/9147; `?role=nurse` → 1462/9147; `?role=zzzznomatch` → 0/9147                                     |
| `_full_name()` annotation vs. Python fallback                  | Identical names returned for all 6 annotated models; row counts match exactly (no silent drop via an unexpected join)       |
| pre-commit (black, flake8, isort) on all changed backend files | Clean                                                                                                                       |
| `npx tsc --noEmit` (frontend)                                  | Clean                                                                                                                       |
| `npm run lint`                                                 | Clean, 0 errors/warnings                                                                                                    |
| `npm run build`                                                | Succeeds; output confirms real per-route chunks and a separate `vendor-charts` chunk out of the initial bundle              |

## Files changed

Backend: `back/hms/settings.py`, `back/hms/views.py`, `back/hms/serializers.py`,
`back/hms/analytics.py`, `Dockerfile`, plus two live-DB index changes (no migration —
`managed = False` models, raw DDL per `CLAUDE.md`).

Frontend: `front/src/App.tsx`, `front/src/contexts/AuthContext.tsx`,
`front/src/components/SearchBar.tsx`, `front/src/pages/dashboard/Dashboard.tsx`, all six list
pages (`front/src/pages/{person,employee,schedule,facility,infection,vaccination}/*List.tsx`),
`front/vite.config.ts`, plus five new components: `front/src/components/{Skeleton,PersonCard,
EmployeeCard,ScheduleCard,FacilityCard}.tsx`.
