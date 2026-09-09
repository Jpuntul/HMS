# Notes Index

Six dated engineering notes from one week's security-hardening pass,
published as-is. Additional internal engineering notes exist from earlier
work on this repo and are kept private for now — some describe still-open
findings that aren't ready for a public read; see "Publishing scope" below
rather than treating this as the full history.

Status follows the ADR convention: **Current** (nothing has changed since
written) or **Declined** (a real decision not to build something, recorded
with the same rigor as an accepted one). Notes are never edited in place to
reflect later work — that's what a newer dated note is for.

---

## Security & auth

| Note                                                                             | Status                                                                                                                                                                        |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [LOGIN_SECURITY_HARDENING_2026-09-08.md](LOGIN_SECURITY_HARDENING_2026-09-08.md) | Current. Login throttle, refresh-token blacklist on rotation, real password-strength validation on registration.                                                              |
| [RBAC_STAFF_WRITE_GATE_2026-09-09.md](RBAC_STAFF_WRITE_GATE_2026-09-09.md)       | Current. First RBAC increment — any authenticated account reads, only staff accounts write. Deliberately coarse; role-based RBAC is a scoped future pass, not a gap.          |
| [AUDIT_LOG_2026-09-09.md](AUDIT_LOG_2026-09-09.md)                               | Current. Every create/update/delete now records who did it, to what, and when.                                                                                                |
| [CSP_2026-09-09.md](CSP_2026-09-09.md)                                           | Current. A strict Content-Security-Policy (no `unsafe-inline`) on both the API and the frontend, verified live in a browser rather than assumed.                              |
| [DECLINED_2026-09-09.md](DECLINED_2026-09-09.md)                                 | Current. Two roadmap items decided _against_, in ADR format: field-level encryption at rest, and multi-factor authentication — both with the reasoning, not just the verdict. |

## Deployment & dependencies

| Note                                                           | Status                                                                                                      |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [DEPENDENCY_LOCK_2026-09-09.md](DEPENDENCY_LOCK_2026-09-09.md) | Current. Backend dependencies pinned via pip-tools; Dependabot covers pip, npm, Docker, and GitHub Actions. |

---

## Publishing scope

This is a deliberate subset, not the complete notes history. The criteria:
a note is published once its findings are either resolved or explicitly
closed as a decision (see `DECLINED_2026-09-09.md` for what "closed" looks
like for something that wasn't built). Notes describing still-open,
unresolved findings — schema/performance recommendations not yet applied,
audit items still pending a decision — stay private until they reach that
state, on the same reasoning: a note's value is the documented judgment
call, and an unfinished finding read out of context isn't that yet.
