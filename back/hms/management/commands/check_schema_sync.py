"""Detect drift between Django models and the live MySQL schema.

Every domain model is `managed = False`, so Django will never correct drift
for us. This command asserts that, for each model, the columns declared via
`db_column` exist in the database table. It checks column presence only —
not types, indexes, or constraints.

Wire into CI as: ``python manage.py check_schema_sync`` (exits non-zero on drift).
"""

from django.apps import apps
from django.core.management.base import BaseCommand, CommandError
from django.db import connection

DOMAIN_APP_LABEL = "hms"


class Command(BaseCommand):
    help = "Compare Django models against live DB columns; fail on drift."

    def handle(self, *args, **options):
        live: dict[str, set[str]] = {}
        with connection.cursor() as cursor:
            for model in apps.get_app_config(DOMAIN_APP_LABEL).get_models():
                if model._meta.managed:
                    continue
                table = model._meta.db_table
                try:
                    description = connection.introspection.get_table_description(
                        cursor, table
                    )
                except Exception as exc:  # table missing or unreadable
                    live[table] = set()
                    self.stderr.write(f"warn: could not introspect `{table}`: {exc}")
                    continue
                live[table] = {col.name for col in description}

        missing: list[str] = []
        for model in apps.get_app_config(DOMAIN_APP_LABEL).get_models():
            if model._meta.managed:
                continue
            table = model._meta.db_table
            columns = live.get(table, set())
            if not columns:
                missing.append(f"{model.__name__}: table `{table}` not found in DB")
                continue
            for field in model._meta.get_fields():
                if not hasattr(field, "column") or field.column is None:
                    continue
                if field.many_to_many or field.one_to_many:
                    continue
                if field.column not in columns:
                    missing.append(
                        f"{model.__name__}.{field.name} -> column `{field.column}` "
                        f"missing from `{table}` (live: {sorted(columns)})"
                    )

        if missing:
            raise CommandError(
                "Schema drift detected between Django models and MySQL:\n  - "
                + "\n  - ".join(missing)
            )

        checked = sum(1 for t in live if live[t])
        self.stdout.write(
            self.style.SUCCESS(f"Schema in sync: {checked} table(s) verified.")
        )
