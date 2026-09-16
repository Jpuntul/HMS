# CLAUDE.md

Guidance for Claude Code working in this repository.

## Working agreement

- **Ask before committing.** Show me what changed and wait for my go-ahead.
  Do not run `git commit` on your own initiative, even when the change is small
  or obviously correct.
- **Never push or open a PR** unless I ask for it explicitly.
- **Commit directly to `main`.** This is a solo repo with no branch workflow
  in practice — every commit in history so far is on `main`. Don't create
  feature branches unless I ask for one for a specific reason (e.g. trying
  something disposable).

## Project invariants

These are non-obvious and easy to violate. Check them before changing anything
in `back/hms/`.

### The database schema is not Django's

All ten domain models are `managed = False`. Django did not create these tables
and cannot alter them.

- **Never run `makemigrations` for domain models.** Migrations only cover
  Django's own auth/session/admin tables, plus `AuditLogEntry`
  (`hms/models.py`) — the one project model that's genuinely `managed = True`
  and is Django's to create/alter normally. A bare `makemigrations hms` will
  try to sweep the domain models in too (they've never had migration state
  recorded); discard that and hand-write a migration touching only the
  intended model, the way `hms/migrations/0003_auditlogentry.py` does.
- Schema changes ship as **raw SQL** (`ALTER TABLE`), not migrations.
  `Meta.indexes` on an unmanaged model emits nothing.
- `models.py` only _claims_ the columns exist. Nothing enforces it — drift is
  silent. `python manage.py check_schema_sync` compares them (column presence
  only, not types or indexes).
- Composite primary keys must be declared in the same order as the real MySQL
  PRIMARY index, which is not always the physical column order.

### Three identifiers, three different jobs

| Field      | Role                                         | May appear in a URL? |
| ---------- | -------------------------------------------- | -------------------- |
| `Medicare` | the declared primary key                     | **No**               |
| `SSN`      | the logical join key, FK target for 6 tables | **No**               |
| `UUID`     | opaque public identifier                     | **Yes — only this**  |

SSN and Medicare are PII. They must never enter a URL path, a query string, a
log line, or a redirect. See `notes/UUID_URLS_2026-05-26.md`.

### Deletes are soft

Models use `SoftDeleteModelMixin`. `Model.objects` hides rows with `deleted_at`
set; `Model.all_objects` bypasses the filter. `.delete()` sets the timestamp —
use `.hard_delete()` only when you genuinely mean it.

### Auth is default-deny, and writes are staff-gated

`REST_FRAMEWORK` in `settings.py` sets `IsStaffOrReadOnly` for every
endpoint (`hms/permissions.py`): any authenticated user may read, only
`is_staff` accounts may create/update/delete. `AllowAny` is a deliberate
exception and there are only three: login, and the two health probes.
**Adding a fourth needs a reason.** Exceptions should look unusual in the
code — that is the point of the default.

This is a coarse, first-pass RBAC — staff vs. everyone, not yet
role-specific (`Employee.role` isn't consulted for permissions). Don't
add a per-view `permission_classes` override for "only this role can
write this model" without reading
`notes/RBAC_STAFF_WRITE_GATE_2026-09-09.md` first; the role-based version
is scoped as a deliberate future pass, not an oversight.

### Writes are audited

Every create/update/delete on the generic CRUD views goes through
`AuditLogMixin` (`hms/views.py`), which writes one `AuditLogEntry` — actor,
action, model, pk, timestamp — after the operation succeeds. Adding a new
`generics.*APIView` for a domain model needs `AuditLogMixin` in its base
classes, or that model's writes go unlogged silently.

### Tests are blocked, not skipped

`managed = False` means the test runner creates none of the domain tables, so
any test touching `Person` fails on a missing table. Adding a test framework is
not the fix; making the schema reproducible is. This decision is still open —
see `notes/AUDIT_2026-08-18.md` §2.1. `back/schema.sql` (structure only, no
data — see Commands) is a step toward this, not the fix itself: nothing wires
it into the test runner yet.

## Commands

```bash
# Backend (from back/)
../.venv/bin/python manage.py check
../.venv/bin/python manage.py check_schema_sync     # model/DB drift
../.venv/bin/python manage.py runserver             # dev only

# Deploy checks, as CI runs them
DEBUG=False SECRET_KEY=... ALLOWED_HOSTS=example.com \
  ../.venv/bin/python manage.py check --deploy --fail-level ERROR

# Backend: bump a dependency within requirements.in's bounds
.venv/bin/pip install pip-tools   # once
.venv/bin/pip-compile back/requirements.in --output-file=back/requirements.txt --no-strip-extras
pip install -r back/requirements.txt   # sync your venv to the new lock

# Frontend (from front/)
npm run dev
npm run lint
npx tsc --noEmit

# Everything the CI lint job runs
SKIP=eslint,typescript-check,prettier .venv/bin/pre-commit run --all-files

# Container
docker build -t hms-api .

# Re-export the schema (structure only, no data/PII) after any raw-SQL change
mysqldump -u root -p --no-data --routines --triggers hms_db > back/schema.sql
```

## Conventions

- Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `ci:`), scoped
  to one concern each.
- Significant refactors get a dated write-up in `notes/`, following the existing
  format: why, what changed, verification, and an explicit "what's NOT in this
  pass" section. The `refactor-note` skill (`.claude/skills/refactor-note/`)
  encodes this format.
- **`notes/` is published by default; `notes/private/` is not.** New notes
  go straight to `notes/` (tracked normally) unless they're a draft or
  describe a still-open, unresolved finding — those go in `notes/private/`
  (gitignored wholesale) instead. See `notes/INDEX.md`.
