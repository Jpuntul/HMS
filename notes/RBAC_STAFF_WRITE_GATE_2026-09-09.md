# RBAC — Staff Write Gate — 2026-09-09

First increment of the RBAC item from the security review's roadmap
(A01, Broken Access Control — the review's one Critical finding). Builds on
[LOGIN_SECURITY_HARDENING_2026-09-08.md](LOGIN_SECURITY_HARDENING_2026-09-08.md).

## Why

Every authenticated account had identical permissions: a receptionist could
edit the general manager's facility record or delete any patient's
infection history, because no view anywhere defined
`has_object_permission`, and the global default was a bare `IsAuthenticated`
— authenticated, not authorized. That's the review's A01 finding.

## Scope decision

Two designs were on the table: coarse (staff-only writes, reusing the
`is_staff` flag that already gates registration) vs. role-based (a new
`User`↔`Employee` link, permissions keyed to `Employee.role`'s 8 values).
**Chose coarse, deliberately** — it closes the worse half of the gap (any
account can currently write anything) in about two hours instead of a
multi-day pass, and it doesn't foreclose the role-based version later; it's
a strict subset of it. Role-based RBAC (distinguishing a nurse from a
receptionist from a doctor) remains open, tracked as its own future pass.

## What changed

**`hms/permissions.py` (new).** `IsStaffOrReadOnly`: any authenticated user
may read (`SAFE_METHODS`); only `request.user.is_staff` may write. Explicitly
re-checks `is_authenticated` before the method check — a read-permissive
permission class that skipped that would silently reopen anonymous reads,
the exact hole AUTH_FOUNDATION closed.

**`settings.py`.** `DEFAULT_PERMISSION_CLASSES` → `IsStaffOrReadOnly`,
replacing the bare `IsAuthenticated`. This is the single point of control:
`views.py` and `analytics.py` have zero per-view `permission_classes`
overrides (confirmed via grep before changing this), so every one of the
30+ domain endpoints picked up the new gate at once — same "put the safe
behaviour in the default" pattern AUTH_FOUNDATION already established for
auth-by-default.

**Frontend: nothing changed, and that was verified, not assumed.** Checked
whether a non-staff user hitting the new 403 would see a broken or silent
failure. It doesn't: `AddPerson.tsx` (and by inspection, the same pattern
across the Add/Edit pages) reads `error.response.data.detail` and displays
it; `DeleteConfirmationModal.tsx` catches the delete failure and shows an
error banner. DRF's `PermissionDenied` body is exactly
`{"detail": "You do not have permission to perform this action."}`, so a
non-staff user sees that real message, not a crash or a silent no-op.

## What's NOT in this pass

**Non-staff users still see Add/Edit/Delete buttons they can't use.**
`is_staff` is checked in exactly three frontend files today (`App.tsx`,
`AuthContext.tsx`, `Register.tsx` — the existing "Register User" button
gate). None of the 6 list pages or 12 Add/Edit form pages check it before
rendering their write controls. The failure mode is honest (a real
permission-denied message, not silence) but the UX is clunky: a non-staff
user can click "Delete" and be told no. Left out of this pass on purpose —
it touches on the order of a dozen files for a coarse gate that may be
superseded once role-based permissions exist, so the polish is better spent
once the final permission shape is known.

**Role-based permissions** (`Employee.role` → per-model access,
"a doctor edits only their own patients") — the two heavier options from
the roadmap discussion, still open, still their own pass.

## Verification

Manual, against a live `runserver` with real MySQL:

| Check                                                 | Result                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Anonymous `GET /api/persons/`                         | `401` — confirms the original auth-by-default fix didn't regress                                       |
| Non-staff, authenticated `GET /api/facilities/`       | `200` — reads still open to any staff account                                                          |
| Non-staff, authenticated `POST /api/facilities/`      | `403` — the fix                                                                                        |
| Staff `GET /api/facilities/`                          | `200`                                                                                                  |
| Staff `POST /api/facilities/` with an incomplete body | `400`, not `403` — proves staff clears the permission layer and only then hits normal field validation |

`manage.py check` and `check_schema_sync` clean. `black`/`flake8`/`isort`
clean via `pre-commit run`.
