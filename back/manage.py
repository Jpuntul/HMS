#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hms.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # If running runserver and no port specified, use PORT from .env
    if len(sys.argv) >= 2 and sys.argv[1] == "runserver":
        port = os.getenv("PORT", "8000")
        # Only add port if not already specified
        if len(sys.argv) == 2:
            sys.argv.append(f"0.0.0.0:{port}")

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
