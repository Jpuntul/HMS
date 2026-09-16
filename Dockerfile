# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Build stage: compile wheels (mysqlclient needs a C toolchain) into a venv.
# Keeping this separate means the compiler never ships to production.
# ---------------------------------------------------------------------------
FROM python:3.13-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# build-essential + the MySQL client headers are required to compile
# mysqlclient. pkg-config is how its setup.py locates those headers.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        default-libmysqlclient-dev \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY back/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt


# ---------------------------------------------------------------------------
# Runtime stage: the venv plus only the shared library mysqlclient links to.
# ---------------------------------------------------------------------------
FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# libmariadb3 is the runtime half of default-libmysqlclient-dev. Without it
# `import MySQLdb` fails at startup with a missing .so.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libmariadb3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv

# Run as a non-root user. If the process is ever compromised, it has no
# ability to write outside what it owns.
RUN useradd --create-home --uid 1000 app
WORKDIR /app
COPY --chown=app:app back/ /app/back/
USER app
WORKDIR /app/back

# Collect static at BUILD time, not on boot: the manifest that
# CompressedManifestStaticFilesStorage produces must exist before the first
# request, and doing it here means it happens once rather than per container.
#
# settings.py refuses to start with DEBUG=False and no SECRET_KEY, so a
# throwaway key is supplied for this one command. It is never used to sign
# anything and never reaches the running container.
RUN DJANGO_SETTINGS_MODULE=hms.settings \
    DEBUG=False \
    SECRET_KEY=build-time-only-not-a-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa \
    ALLOWED_HOSTS=localhost \
    python manage.py collectstatic --noinput

EXPOSE 8000

# `sh -c` so $PORT expands — hosting platforms inject it and expect the process
# to bind there. `exec` then REPLACES the shell with gunicorn, so gunicorn is
# PID 1 and receives SIGTERM directly. Without exec, the shell holds PID 1,
# swallows the signal, and the platform kills in-flight requests instead of
# letting them drain on deploy.
#
# Workers: (2 x CPU) + 1 is the usual starting point for sync workers. Two is
# right for a small instance; raise it only when metrics say so, and mind the
# connection arithmetic (workers x instances vs MySQL max_connections).
#
# gthread instead of the sync default: each worker runs multiple threads, so
# one worker can hold several I/O-bound requests (waiting on MySQL) in flight
# at once instead of blocking the whole worker on one. Thread count doesn't
# multiply the MySQL connection arithmetic above by itself - CONN_MAX_AGE
# (settings.py) means each thread that has queried keeps its own persistent
# connection, so real ceiling is workers x threads x instances.
CMD ["sh", "-c", "exec gunicorn hms.wsgi:application \
    --bind 0.0.0.0:${PORT:-8000} \
    --workers ${WEB_CONCURRENCY:-2} \
    --threads ${GUNICORN_THREADS:-4} \
    --worker-class gthread \
    --timeout 60 \
    --graceful-timeout 30 \
    --access-logfile - \
    --error-logfile -"]
