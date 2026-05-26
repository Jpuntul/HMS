import uuid

from django.db import models
from django.utils import timezone


class SoftDeleteManager(models.Manager):
    """Default manager that hides rows with deleted_at set.

    Use `Model.all_objects` to bypass the filter (admin views, restore flows).
    """

    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)


class SoftDeleteModelMixin(models.Model):
    """Adds `deleted_at` + soft-delete semantics to a managed=False model.

    The custom manager is configured per-subclass since Django requires the
    first declared manager (`objects`) to be on the concrete model, not the
    mixin, when the mixin is abstract.
    """

    deleted_at = models.DateTimeField(
        null=True, blank=True, db_column="DeletedAt", editable=False
    )

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        self.deleted_at = timezone.now()
        self.save(using=using, update_fields=["deleted_at"])

    def hard_delete(self, using=None, keep_parents=False):
        """Bypass soft delete and actually remove the row."""
        super().delete(using=using, keep_parents=keep_parents)

    def restore(self):
        self.deleted_at = None
        self.save(update_fields=["deleted_at"])


class Person(SoftDeleteModelMixin, models.Model):
    # SSN is the logical join key across the system. The schema declares it
    # nullable, but FK(to_field="ssn") rows require non-null values.
    ssn = models.IntegerField(unique=True, null=True, blank=True, db_column="SSN")

    # Medicare is the declared primary key in MySQL. Stored, but never used
    # in URLs - see `uuid` below for the public identifier.
    medicare = models.CharField(max_length=12, primary_key=True, db_column="Medicare")

    # Opaque public identifier. Used in every URL that historically would have
    # contained SSN or Medicare. Existing rows were backfilled via MySQL's
    # UUID() function; new rows get a fresh v4 via the default.
    uuid = models.UUIDField(
        unique=True, default=uuid.uuid4, editable=False, db_column="UUID"
    )

    first_name = models.CharField(max_length=30, db_column="FirstName")
    last_name = models.CharField(max_length=30, db_column="LastName")
    dob = models.DateField(db_column="DOB")

    telephone = models.CharField(
        max_length=10, unique=True, null=True, blank=True, db_column="Telephone"
    )
    citizenship = models.CharField(
        max_length=30, null=True, blank=True, db_column="Citizenship"
    )
    email = models.EmailField(max_length=320, null=True, blank=True, db_column="Email")
    occupation = models.CharField(
        max_length=30, null=True, blank=True, db_column="Occupation"
    )

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        db_table = "Persons"
        managed = False

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Employee(SoftDeleteModelMixin, models.Model):
    ROLE_CHOICES = [
        ("nurse", "Nurse"),
        ("doctor", "Doctor"),
        ("cashier", "Cashier"),
        ("pharmacist", "Pharmacist"),
        ("receptionist", "Receptionist"),
        ("administrative personnel", "Administrative Personnel"),
        ("security personnel", "Security Personnel"),
        ("regular employee", "Regular Employee"),
    ]

    person = models.OneToOneField(
        Person,
        to_field="ssn",
        db_column="SSN",
        primary_key=True,
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        related_name="employee",
    )
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, db_column="Role")

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        db_table = "Employees"
        managed = False

    def __str__(self):
        return f"Employee {self.person_id} - {self.role}"


class Facility(SoftDeleteModelMixin, models.Model):
    TYPE_CHOICES = [
        ("Hospital", "Hospital"),
        ("CLSC", "CLSC"),
        ("Clinic", "Clinic"),
        ("Pharmacy", "Pharmacy"),
        ("Special installment", "Special installment"),
    ]

    fid = models.AutoField(primary_key=True, db_column="FID")
    name = models.CharField(max_length=50, unique=True, db_column="Name")
    address = models.CharField(max_length=100, db_column="Address")
    city = models.CharField(max_length=50, db_column="City")
    province = models.CharField(max_length=25, db_column="Province")
    postal_code = models.CharField(max_length=6, db_column="PostalCode")
    phone_number = models.CharField(max_length=10, unique=True, db_column="PhoneNumber")
    web_address = models.URLField(max_length=255, db_column="WebAddress")
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, db_column="Type")
    capacity = models.IntegerField(null=True, blank=True, db_column="Capacity")
    general_manager = models.OneToOneField(
        Person,
        to_field="ssn",
        db_column="GMSSN",
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        related_name="managed_facility",
    )

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        db_table = "Facilities"
        managed = False

    def __str__(self):
        return f"{self.name} ({self.type})"


class Residence(SoftDeleteModelMixin, models.Model):
    TYPE_CHOICES = [
        ("apartment", "Apartment"),
        ("condominium", "Condominium"),
        ("semidetached house", "Semi-Detached House"),
        ("house", "House"),
    ]

    res_id = models.AutoField(primary_key=True, db_column="ResID")
    address = models.CharField(max_length=100, db_column="Address")
    city = models.CharField(max_length=50, db_column="City")
    province = models.CharField(max_length=25, db_column="Province")
    postal_code = models.CharField(max_length=6, db_column="PostalCode")
    no_of_bedrooms = models.IntegerField(
        null=True, blank=True, db_column="NoOfBedrooms"
    )
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, db_column="Type")

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        db_table = "Residences"
        managed = False

    def __str__(self):
        return f"{self.address}, {self.city}"


class InfectionType(models.Model):
    type_id = models.AutoField(primary_key=True, db_column="TypeID")
    type_name = models.CharField(max_length=50, unique=True, db_column="TypeName")

    class Meta:
        db_table = "InfectionTypes"
        managed = False

    def __str__(self):
        return self.type_name


class Infection(SoftDeleteModelMixin, models.Model):
    pk = models.CompositePrimaryKey("person", "date", "infection_type")
    person = models.ForeignKey(
        Person,
        to_field="ssn",
        db_column="SSN",
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        related_name="infections",
    )
    date = models.DateField(db_column="Date")
    infection_type = models.ForeignKey(
        InfectionType,
        db_column="TypeID",
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        related_name="infections",
    )

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        db_table = "Infections"
        managed = False

    def __str__(self):
        return f"Infection {self.infection_type_id} - {self.date}"


class VaccineType(models.Model):
    type_id = models.AutoField(primary_key=True, db_column="TypeID")
    type_name = models.CharField(max_length=50, unique=True, db_column="TypeName")

    class Meta:
        db_table = "VaccineTypes"
        managed = False

    def __str__(self):
        return self.type_name


class Vaccination(SoftDeleteModelMixin, models.Model):
    pk = models.CompositePrimaryKey("person", "vaccine_type", "date")
    person = models.ForeignKey(
        Person,
        to_field="ssn",
        db_column="SSN",
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        related_name="vaccinations",
    )
    vaccine_type = models.ForeignKey(
        VaccineType,
        db_column="TypeID",
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        related_name="vaccinations",
    )
    date = models.DateField(db_column="Date")
    no_of_dose = models.IntegerField(null=True, blank=True, db_column="NoOfDose")
    facility = models.ForeignKey(
        Facility,
        db_column="FID",
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        related_name="vaccinations",
    )

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        db_table = "Vaccinations"
        managed = False

    def __str__(self):
        return f"Vaccination {self.vaccine_type_id} - {self.date}"


class Employment(SoftDeleteModelMixin, models.Model):
    pk = models.CompositePrimaryKey("employee", "facility", "start_date")
    employee = models.ForeignKey(
        Employee,
        db_column="ESSN",
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        related_name="employments",
    )
    facility = models.ForeignKey(
        Facility,
        db_column="FID",
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        related_name="employments",
    )
    start_date = models.DateField(db_column="StartDate")
    end_date = models.DateField(null=True, blank=True, db_column="EndDate")

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        db_table = "Employments"
        managed = False

    def __str__(self):
        return f"Employment {self.employee_id} at {self.facility_id}"


class Schedule(SoftDeleteModelMixin, models.Model):
    pk = models.CompositePrimaryKey("employee", "facility", "date", "start_time")
    employee = models.ForeignKey(
        Employee,
        db_column="ESSN",
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        related_name="schedules",
    )
    facility = models.ForeignKey(
        Facility,
        db_column="FID",
        db_constraint=False,
        on_delete=models.DO_NOTHING,
        related_name="schedules",
    )
    date = models.DateField(db_column="Date")
    start_time = models.TimeField(db_column="StartTime")
    end_time = models.TimeField(null=True, blank=True, db_column="EndTime")

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        db_table = "Schedules"
        managed = False

    def __str__(self):
        return f"Schedule {self.employee_id} - {self.date}"
