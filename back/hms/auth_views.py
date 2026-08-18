"""Auth endpoints: JWT login (access + refresh), profile, register, check.

The legacy DRF Token-based login was replaced with djangorestframework-simplejwt
in the auth foundation pass. The wire shape of /api/auth/login/ stays
backwards-compatible: success returns user info plus tokens, just under
`access` / `refresh` keys instead of a single `token`.
"""

import json

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
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
    """POST /api/auth/login/ -> {access, refresh, user, success, message}."""

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    authentication_classes: list = []


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Stateless logout for JWT.

    With JWT there is no server-side session to destroy. The frontend should
    drop both access and refresh tokens locally. We respond 200 either way
    so the UI can finalize without a network-error UX.
    """
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
