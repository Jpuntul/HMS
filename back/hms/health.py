"""Health probes for uptime monitoring and platform health checks.

Two endpoints, deliberately different, because conflating them causes outages:

- `/health/`  liveness. Is this process running and able to answer? Nothing
              external is touched, so a database blip can never cause a
              platform to kill or drain healthy application instances.

- `/health/ready/`  readiness. Can this process actually do useful work, i.e.
              is the database reachable? This is the one an external uptime
              monitor should watch, because a running process with no database
              is not a working service.

Both are `AllowAny`. Every other endpoint in this project requires a token by
default (see REST_FRAMEWORK in settings), so these are the deliberate
exceptions - a monitor cannot authenticate, and a platform health check must
not need a secret. There should only ever be a handful of these, and they
should look unusual in the codebase.
"""

import logging

from django.db import connection
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger("hms.health")


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def health(request):
    """Liveness: the process is up. Never touches the database."""
    return Response({"status": "ok"}, status=status.HTTP_200_OK)


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def health_ready(request):
    """Readiness: the process is up *and* the database answers.

    Returns 503 on failure so a monitor treats it as down. The exception detail
    is logged but deliberately not returned - an unauthenticated endpoint must
    not leak database hostnames, credentials, or driver internals.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        logger.exception("Readiness check failed: database unreachable")
        return Response(
            {"status": "unavailable", "database": "unreachable"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response({"status": "ok", "database": "ok"}, status=status.HTTP_200_OK)
