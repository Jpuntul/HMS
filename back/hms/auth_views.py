"""Auth endpoints: JWT login (access + refresh), profile, register, check.

The legacy DRF Token-based login was replaced with djangorestframework-simplejwt
in the auth foundation pass. The wire shape of /api/auth/login/ stays
backwards-compatible: success returns user info plus tokens, just under
`access` / `refresh` keys instead of a single `token`.
"""

import json

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView


def _user_payload(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
    }


class LoginSerializer(TokenObtainPairSerializer):
    """Adds a `user` block to the standard {access, refresh} payload."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = _user_payload(self.user)
        data["success"] = True
        data["message"] = "Login successful"
        return data


class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ -> {access, refresh, user, success, message}.

    Throttled (see REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["login"]) - this
    is an AllowAny endpoint by necessity, so it's the one place credential
    guessing is actually possible without a token.
    """

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    authentication_classes: list = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout for JWT: blacklists the refresh token, if one is sent.

    Previously a no-op - JWT has no server-side session, and the old
    BLACKLIST_AFTER_ROTATION=False meant there was nothing to blacklist even
    if we tried. Now that blacklisting is on, a client that POSTs its
    current `refresh` here actually ends that session server-side, not just
    in its own localStorage.

    Still always responds 200: a missing, already-expired, or
    already-blacklisted refresh token doesn't change the outcome the client
    cares about (it's dropping both tokens locally either way), so this
    never blocks the logout UX on a token-cleanup failure.
    """
    refresh = request.data.get("refresh")
    if refresh:
        try:
            RefreshToken(refresh).blacklist()
        except TokenError:
            pass
    return Response(
        {"success": True, "message": "Logout successful"}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Current user profile."""
    return Response({"user": _user_payload(request.user)}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_view(request):
    """Register a new user account (Admin/Staff only)."""
    if not request.user.is_staff:
        return Response(
            {"error": "Only staff members can register new users"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        data = json.loads(request.body) if request.body else request.data
        username = data.get("username")
        password = data.get("password")
        email = data.get("email", "")
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")

        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # AUTH_PASSWORD_VALIDATORS in settings.py is configured but never
        # consulted by User.objects.create_user() below - that call just
        # hashes whatever it's given. validate_password() is what actually
        # runs the validators, and it must be called explicitly. Building an
        # *unsaved* User to pass as `user=` matters: without it,
        # UserAttributeSimilarityValidator silently no-ops (it returns
        # immediately when user is None), so a password equal to the
        # username would otherwise pass.
        candidate = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        try:
            validate_password(password, user=candidate)
        except DjangoValidationError as exc:
            return Response(
                {"error": " ".join(exc.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )

        return Response(
            {
                "success": True,
                "message": "User registered successfully",
                "user": _user_payload(user),
            },
            status=status.HTTP_201_CREATED,
        )

    except json.JSONDecodeError:
        return Response(
            {"error": "Invalid JSON data"}, status=status.HTTP_400_BAD_REQUEST
        )


# `check_auth_view` was removed. It returned a hardcoded {authenticated: false}
# regardless of credentials, and nothing in the frontend called it. The real
# "am I logged in" check is GET /api/auth/profile/ with a Bearer token.
