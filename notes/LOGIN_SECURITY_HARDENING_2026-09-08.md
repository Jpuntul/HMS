# Login Security Hardening — 2026-09-08

Builds on prior internal engineering notes (AUTH_FOUNDATION, 2026-05-25;
an internal audit, 2026-08-18 §4) — not published here. Closes three of
the items both deferred, and one neither caught.

## Why

AUTH_FOUNDATION fixed the front door (no more public PHI). It also opened
three tickets it deliberately didn't close: login throttling, and — named
explicitly in its "Next pass candidates" — `BLACKLIST_AFTER_ROTATION` staying
off. AUDIT_2026-08-18 §4.1 confirmed the cost in plain terms: with rotation
on and blacklisting off, **a stolen refresh token is reusable for its full
24-hour lifetime**, in parallel with the legitimate user, and the settings
comment describing this was factually wrong until the audit's own safe-fixes
pass corrected the wording (not the behavior).

Reading `auth_views.py` for this pass surfaced a fourth issue neither note
had: `register_view` never calls `validate_password()`.
`AUTH_PASSWORD_VALIDATORS` is configured in `settings.py` and did nothing —
`User.objects.create_user()` hashes whatever password it's given and runs no
validators on its own. An admin could register a staff account with a
one-character password.

## What changed

**`BLACKLIST_AFTER_ROTATION` → `True`.** Added
`rest_framework_simplejwt.token_blacklist` to `INSTALLED_APPS`, ran its
(bundled, Django-owned) migrations, flipped the flag. A refresh token is now
usable exactly once — the instant either party rotates it, the other's copy
is rejected server-side, not just superseded client-side.

**Login is throttled.** `ScopedRateThrottle` on `LoginView`,
`throttle_scope = "login"`, rate `5/min` via
`DEFAULT_THROTTLE_RATES`. Two things worth stating plainly rather than
letting them surface later as a false sense of security:

- `NUM_PROXIES` is now set (default `1`, env-overridable). DRF's
  `get_ident()` uses the _entire_ `X-Forwarded-For` value as the rate-limit
  key when `NUM_PROXIES` is unset — a client can vary one header and land in
  a fresh bucket every request. This makes the throttle enforce against the
  correct hop instead. **The default of 1 is a guess** ("one PaaS edge
  proxy"); verify Railway's actual proxy depth once this is deployed.
- The throttle counter lives in Django's default `LocMemCache` — per
  process, not shared across gunicorn's 2 workers, and reset on every
  deploy. The real ceiling today is closer to 2× the configured rate. Fine
  at 3 accounts; the fix if it ever isn't is a shared cache, which is also
  the first thing in this codebase to actually hit the system-design
  notes' stated cache trigger ("state shared across more than one
  process").

**Registration validates passwords.** `register_view` now calls
`validate_password(password, user=candidate)` before `create_user()`, where
`candidate` is an _unsaved_ `User(username=..., email=..., ...)` — passing
`user=` matters because `UserAttributeSimilarityValidator` silently no-ops
when `user` is `None`, which would otherwise pass a password equal to the
username. Failure returns 400 with the validators' own messages.

**Logout blacklists the refresh token.** Previously a 200-only stub (JWT has
no server session, and blacklisting was off, so there was nothing to
revoke). Now `logout_view` reads `refresh` from the request body and calls
`RefreshToken(refresh).blacklist()`, swallowing `TokenError` — a missing,
expired, or already-blacklisted token still returns 200, since the client is
dropping both tokens locally regardless. `AuthContext.logout()` updated to
send the refresh token it's holding.

**Frontend: the blacklist race.** Turning on blacklist-after-rotation has a
real cost the notes hadn't priced: two browser tabs share one refresh token
via `localStorage`. If both are mid-refresh at once, one wins and rotates
it; the other's identical request is now correctly rejected as
already-used. Before this pass that was harmless (blacklisting was off); now
it would log the losing tab out and — worse — `clearTokens()` would wipe the
_winning_ tab's fresh session out of shared `localStorage`. `refreshAccess()`
in `AuthContext.tsx` now checks, on a failed refresh, whether `localStorage`
holds a _different_ refresh token than the one just attempted; if so, it
adopts the sibling tab's fresh access token instead of treating the loss as
a real logout.

## Verification

Manual, against a live `runserver` + real MySQL (`manage.py check`,
`check_schema_sync`, and `migrate` all ran clean first):

| Check                                                         | Result                                                                                                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Login with correct credentials                                | 200, `{access, refresh, user, ...}`                                                                                                |
| Register with password == username-derived, 6 chars           | 400, `"too similar to the username... too short..."`                                                                               |
| Register with a strong password                               | 201                                                                                                                                |
| 6 rapid login attempts (5/min configured)                     | 401×3, then `429` from the 6th call to `LoginView` in-window (an earlier successful login in the same window counted toward the 5) |
| Use a refresh token, then reuse the _same_ pre-rotation token | first: 200, new pair. second: `401`                                                                                                |
| Login → logout(refresh) → reuse that refresh                  | logout `200`; reuse `401`                                                                                                          |

`black`, `flake8`, `isort` (via `pre-commit run`), `tsc --noEmit`, `eslint`,
and `prettier --check` all pass on the changed files.

## What's NOT in this pass

**Access/refresh token storage (httpOnly cookie).** Both tokens still live
in `localStorage`, XSS-readable — the audit's §4.2 "stronger pattern" isn't
built here. Deliberately deferred, not forgotten:

- The correct implementation needs `SameSite=None; Secure` on the refresh
  cookie, because the deployed frontend (Cloudflare Pages) and API
  (Railway) are different registrable domains — genuinely cross-site, not
  just cross-port. Locally, `localhost:5173` → `localhost:8001` is
  same-site regardless of port, so `SameSite=Lax` would work perfectly on a
  dev machine and silently fail in production. That divergence can't be
  caught without deploying first.
- `SameSite=None` then requires real CSRF defense on the cookie-authenticated
  endpoints (refresh, and logout if it clears the cookie) — Django's
  `CsrfViewMiddleware` is already in the stack and its CSRF cookie is
  non-`httpOnly` by design for exactly this double-submit pattern, so the
  Django-native path is `csrf_protect` on those two views plus an
  `X-CSRFToken` header from the SPA. Not wired up yet.
- Worth stating precisely, so this doesn't get oversold later: an httpOnly
  refresh cookie does **not** stop XSS from acting as the user — injected
  script can still call the API with whatever access token is in memory, or
  hit `/api/auth/refresh/` and ride the cookie. What it stops is
  **exfiltration** of a long-lived token for reuse outside the victim's
  browser. Real, narrower than "tokens are now safe from XSS."

Scoped as its own pass, sequenced after an actual deployment exists to test
the cross-site cookie path against.

**Everything else already tracked and still open:** RBAC + `User`↔`Employee`
link (AUTH_FOUNDATION), the 3 unmapped tables, the `Schedules` index,
unblocking tests. None of this pass touches those.
