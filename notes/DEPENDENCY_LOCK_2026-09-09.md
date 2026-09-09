# Dependency Lock + Dependabot — 2026-09-09

Fifth item from the security review's roadmap (A06/A08, item skipped from
the numbered list since Sentry (#5) needed nothing but an env var that
doesn't exist yet — see the session that produced
[CSP_2026-09-09.md](CSP_2026-09-09.md)).

## Correction to the roadmap's own assumption

The roadmap said "no lockfile" without qualifying which half of the repo.
Checked before touching anything: `front/package-lock.json` already
exists — npm generates one automatically and it was already committed.
**Only the backend had the gap.** `back/requirements.txt` used open ranges
(`Django>=5.2,<5.3`, bare `python-dotenv`, ...), so CI and a local venv
could resolve different transitive versions of everything Django/DRF/
SimpleJWT depend on, silently.

## What changed

**`back/requirements.in` (new).** The old `requirements.txt`, verbatim,
renamed — this is now the human-edited source of intent ("Django 5.2.x"),
not the install target.

**`back/requirements.txt` — now `pip-compile`-generated, fully pinned.**
Every direct _and transitive_ dependency pinned to an exact version, with
`# via` comments showing what pulled each one in (e.g. `sqlparse==0.6.0 #
via django`). `pip install -r requirements.txt` — the command in the
README and CLAUDE.md — is unchanged; only what it installs is now
reproducible.

To bump a version within `requirements.in`'s bounds:

```
.venv/bin/pip install pip-tools
.venv/bin/pip-compile requirements.in --output-file=requirements.txt --no-strip-extras
pip install -r requirements.txt   # sync your venv to the new lock
```

`--no-strip-extras` matters here specifically: `sentry-sdk[django]` needs
its `[django]` extra preserved, and pip-tools 8.0 is changing that default.
Pinned the flag rather than letting a future `pip-compile` run silently
drop it.

**`.github/dependabot.yml` (new).** Four ecosystems, weekly: `pip` (`/back`),
`npm` (`/front`), `docker` (the Dockerfile), `github-actions` (the CI
workflow itself). The latter two were free additions once writing the file
at all — same "buy the generic half" reasoning as everything else on this
list.

## What this surfaced, incidentally

Compiling against current PyPI moved several versions since this venv was
last set up: Django 5.2.14 → 5.2.17 (still LTS, still within the `<5.3`
bound), DRF 3.15+ → 3.18.1, SimpleJWT 5.3+ → 5.5.1. Synced the local venv
to the new lock and re-ran the full login/RBAC verification suite from the
prior three passes — login, anonymous-401, and the auth flow all still
behave identically after the bump. Not expected to matter, verified anyway
rather than assumed, given how much auth-adjacent code changed this week.

## What's NOT in this pass

**No `pip-audit` / vulnerability scanning step in CI.** Dependabot opens
PRs for outdated versions; it doesn't fail a build over a known CVE in
what's currently pinned. A `pip-audit` (or `safety`) step in `ci.yml` would
close that gap — smaller than this pass, not bundled in because it's a CI
change, not a dependency-pinning one.

**CI still installs from a loose range implicitly** in the sense that
nothing in `ci.yml` was changed to fail if `requirements.txt` and
`requirements.in` drift out of sync (someone edits `requirements.in`,
forgets to recompile). Worth a `pip-compile --dry-run` check in CI later;
out of scope for this pass, which was about the lock existing at all.

## Verification

```
manage.py check                 no issues
manage.py check_schema_sync     10 table(s) verified (unaffected by the bump)
POST /api/auth/login/           200, tokens issued (post-bump)
GET  /api/persons/ (anonymous)  401 (post-bump, no regression)
pre-commit run (black/flake8/isort/check-yaml on the new files)   clean
```
