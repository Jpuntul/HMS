# Model-Layer Refactor — 2026-05-24

## Why

The original models had three foundational problems flagged in the architecture audit:

1. **Composite-PK lie.** `Infections`, `Vaccinations`, `Employments`, and `Schedules` use composite primary keys in MySQL, but the Django models declared a single column (e.g. `ssn`) as the PK. Django therefore deduplicated rows by that column, making most data unreachable through the ORM.
2. **Fake foreign keys.** Every join column was `IntegerField`, with related rows fetched via `@property` accessors that issued ad-hoc `.objects.get(...)` calls. Result: N+1 queries on every list endpoint, no `select_related`, no FK-aware filtering.
3. **Stuck on Django 4.2.** No access to `models.CompositePrimaryKey`, which is the native fix for problem 1.

### Verified impact (before vs after)

| Table        | API `count` before | SQL `COUNT(*)` | API `count` after |
| ------------ | -----------------: | -------------: | ----------------: |
| Infections   |               ≤447 |            565 |             565 ✓ |
| Vaccinations |               ≤447 |            755 |             755 ✓ |
| Employments  |               ≤303 |            591 |             591 ✓ |
| Schedules    |               ≤303 |          9,147 |           9,147 ✓ |

Roughly half of the live data was previously invisible to the API.

## Approach

The MySQL schema was correct — only the Python layer was wrong. Every change is at the ORM level. **No `ALTER TABLE` was needed.**

### 1. Django 4.2 → 5.2

[`back/requirements.txt`](../back/requirements.txt): `Django>=5.2,<5.3`, plus DRF/mysqlclient floors bumped to versions known compatible with 5.2.

Django 5.2 introduced [`models.CompositePrimaryKey`](https://docs.djangoproject.com/en/5.2/topics/composite-primary-keys/), which is the entire reason this refactor avoids destructive SQL.

### 2. `CompositePrimaryKey` on junction tables

Each of the four junction models now declares its real composite PK:

```python
class Infection(models.Model):
    pk = models.CompositePrimaryKey("person", "date", "infection_type")
    person = models.ForeignKey(Person, to_field="ssn", db_column="SSN", ...)
    date = models.DateField(db_column="Date")
    infection_type = models.ForeignKey(InfectionType, db_column="TypeID", ...)
```

The model fields participating in the composite PK are the same fields that participate in the natural-key `UNIQUE` constraint in MySQL — so the ORM's view now matches the DB.

### 3. Real `ForeignKey` everywhere

Every integer "join column" was promoted to a real relation:

| Was                               | Now                                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `Employee.ssn: IntegerField` (PK) | `Employee.person: OneToOneField(Person, to_field="ssn", primary_key=True, db_constraint=False)` |
| `Facility.gmssn: IntegerField`    | `Facility.general_manager: OneToOneField(Person, to_field="ssn", db_constraint=False)`          |
| `Infection.ssn / type_id`         | `Infection.person / infection_type` (FKs)                                                       |
| `Vaccination.ssn / type_id / fid` | `Vaccination.person / vaccine_type / facility` (FKs)                                            |
| `Employment.essn / fid`           | `Employment.employee / facility` (FKs)                                                          |
| `Schedule.essn / fid`             | `Schedule.employee / facility` (FKs)                                                            |

All FKs use `db_constraint=False` — MySQL keeps its existing FK constraints; Django doesn't duplicate them. `on_delete=DO_NOTHING` because deletion semantics are managed downstream.

### 4. Query and serializer cleanup

- All junction-table list/detail views now do `select_related("person", "infection_type", ...)`. N+1 storms eliminated.
- `EmployeeListCreateView` lost its hand-rolled `Q`-based search now that `person__first_name`, `person__last_name`, etc. are native search fields.
- Serializers swapped `SerializerMethodField` hops for `source="person.first_name"` traversals. Legacy keys (`ssn`, `type_id`, `fid`, `essn`) are preserved via `source=` aliases so the frontend list pages don't break.

### 5. Detail URL routing for composite PKs

Old routes like `/api/infections/<int:pk>/` were ambiguous under a composite PK. They were replaced with multi-segment URLs and a `CompositeLookupMixin` that maps URL kwargs to model lookups:

| Entity      | New detail URL                                                     |
| ----------- | ------------------------------------------------------------------ |
| Infection   | `/api/infections/<int:ssn>/<str:date>/<int:type_id>/`              |
| Vaccination | `/api/vaccinations/<int:ssn>/<int:type_id>/<str:date>/`            |
| Employment  | `/api/employments/<int:essn>/<int:fid>/<str:start_date>/`          |
| Schedule    | `/api/schedules/<int:essn>/<int:fid>/<str:date>/<str:start_time>/` |

These endpoints were never working correctly under the old PK lie, so the URL change isn't a real regression.

### 6. Schema-drift guard

Because every model is `managed=False`, Django will never warn about drift between models and MySQL. A management command was added:

```bash
python manage.py check_schema_sync
```

It introspects the live DB and verifies that every `db_column` referenced by a model exists. Exits non-zero on drift — suitable for CI.

## What was _not_ changed

- **MySQL schema** — untouched. The original `mysqldump` is still a valid rollback.
- **Frontend code** — list payloads still expose `ssn`, `type_id`, `fid`, `essn`, so list/search/create pages keep working. Detail pages that built URLs from a single key need to be updated to use the composite URL shape (see follow-ups).
- **`facility_analytics`** — still uses the placeholder employee-count estimate; can now be replaced by a real `Count` over `Employment.facility`.

## Verification

| Check                         | How                                                                      | Result                                    |
| ----------------------------- | ------------------------------------------------------------------------ | ----------------------------------------- |
| Server boots                  | `python manage.py runserver` on 5.2.14                                   | ✓                                         |
| `manage.py check`             | clean (after `OneToOneField` swap for `general_manager`)                 | ✓                                         |
| Junction API counts match SQL | `curl /api/{infections,vaccinations,employments,schedules}/?page_size=1` | 565 / 755 / 591 / 9147 ✓                  |
| Schema in sync with DB        | `python manage.py check_schema_sync`                                     | "Schema in sync: 10 table(s) verified." ✓ |

## Files changed

- [back/requirements.txt](../back/requirements.txt)
- [back/hms/models.py](../back/hms/models.py)
- [back/hms/views.py](../back/hms/views.py)
- [back/hms/serializers.py](../back/hms/serializers.py)
- [back/hms/app_urls.py](../back/hms/app_urls.py)
- [back/hms/management/commands/check_schema_sync.py](../back/hms/management/commands/check_schema_sync.py) (new)

## Open follow-ups

1. Frontend detail URLs for infection/vaccination/employment/schedule must use the new composite path.
2. `facility_analytics` can use real `Count` aggregations now.
3. Security: hard-coded `SECRET_KEY` / `DEBUG=True` in `settings.py`, committed `db.sqlite3` (separate cleanup).
4. No audit log, no soft delete — health-data hygiene still pending.
