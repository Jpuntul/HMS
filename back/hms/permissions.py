"""Custom DRF permission classes.

One class today: the first RBAC increment. See
notes/RBAC_STAFF_WRITE_GATE_2026-09-09.md for why this is deliberately
coarse (staff vs. everyone else) rather than keyed to Employee.role.
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsStaffOrReadOnly(BasePermission):
    """Any authenticated user may read; only staff accounts may write.

    Replaces a bare IsAuthenticated as the project-wide default. Before this,
    every authenticated account - nurse, receptionist, doctor - had identical
    write access to every record (AUDIT_2026-08-18 / the security review's
    A01 finding). This doesn't yet distinguish *which* staff member should be
    allowed to write *what* - that needs a User<->Employee link and
    Employee.role, scoped as its own pass - but it closes the wider half of
    the gap: a non-admin account can no longer create, update, or delete
    anything at all.

    Authentication is checked explicitly, not assumed: SAFE_METHODS must
    still require an authenticated user, or this would silently reopen
    anonymous reads - the exact hole AUTH_FOUNDATION closed.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user.is_staff)
