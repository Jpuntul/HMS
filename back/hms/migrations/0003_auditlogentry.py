import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    """Creates AuditLogEntry only.

    Hand-written, not `makemigrations`-generated: this app's other models
    (Employee, Facility, Infection, ...) were deliberately added directly to
    models.py without ever going through makemigrations, since they're all
    managed=False - the schema they describe already exists and isn't
    Django's to create. A bare `makemigrations hms` would sweep all of them
    into this migration's state (CreateModel is a no-op at apply-time for a
    managed=False model, but there's no reason to let migration history
    imply Django tracks them). AuditLogEntry is the one model in this app
    that's actually managed=True and genuinely needs a migration.
    """

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("hms", "0002_employee_facility_alter_person_options"),
    ]

    operations = [
        migrations.CreateModel(
            name="AuditLogEntry",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "action",
                    models.CharField(
                        choices=[
                            ("create", "Create"),
                            ("update", "Update"),
                            ("delete", "Delete"),
                        ],
                        max_length=10,
                    ),
                ),
                ("model_name", models.CharField(max_length=100)),
                ("object_pk", models.CharField(max_length=255)),
                ("object_repr", models.CharField(max_length=200)),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                (
                    "actor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="audit_log_entries",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-timestamp"],
            },
        ),
        migrations.AddIndex(
            model_name="auditlogentry",
            index=models.Index(
                fields=["model_name", "object_pk"],
                name="hms_auditlo_model_n_874e24_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="auditlogentry",
            index=models.Index(
                fields=["actor", "timestamp"], name="hms_auditlo_actor_i_d4e25f_idx"
            ),
        ),
    ]
