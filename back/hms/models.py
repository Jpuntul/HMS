from django.db import models


class Person(models.Model):
    # SSN as IntegerField to match MySQL INT type (unique but not primary key)
    ssn = models.IntegerField(unique=True, null=True, blank=True, db_column="SSN")

    # Medicare as primary key to match MySQL schema
    medicare = models.CharField(max_length=12, primary_key=True, db_column="Medicare")

    # Name fields to match MySQL column names
    first_name = models.CharField(max_length=30, db_column="FirstName")
    last_name = models.CharField(max_length=30, db_column="LastName")

    # Date of birth
    dob = models.DateField(db_column="DOB")

    # Telephone as CHAR(10) to match MySQL
    telephone = models.CharField(
        max_length=10, unique=True, null=True, blank=True, db_column="Telephone"
    )

    # Optional fields
    citizenship = models.CharField(
        max_length=30, null=True, blank=True, db_column="Citizenship"
    )
    email = models.EmailField(max_length=320, null=True, blank=True, db_column="Email")
    occupation = models.CharField(
        max_length=30, null=True, blank=True, db_column="Occupation"
    )

    class Meta:
        db_table = "Persons"  # Use existing MySQL table name
        managed = False  # Don't let Django manage this table (since it exists)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Employee(models.Model):
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

    # SSN as primary key, links to Person
    ssn = models.IntegerField(primary_key=True, db_column="SSN")
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, db_column="Role")

    class Meta:
        db_table = "Employees"
        managed = False

    def __str__(self):
        return f"Employee {self.ssn} - {self.role}"

    @property
    def person(self):
        """Get the related person data"""
        try:
            return Person.objects.get(ssn=self.ssn)
        except Person.DoesNotExist:
            return None


class Facility(models.Model):
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
    gmssn = models.IntegerField(unique=True, db_column="GMSSN")  # General Manager SSN

    class Meta:
        db_table = "Facilities"
        managed = False

    def __str__(self):
        return f"{self.name} ({self.type})"

    @property
    def general_manager(self):
        """Get the general manager person data"""
        try:
            return Person.objects.get(ssn=self.gmssn)
        except Person.DoesNotExist:
            return None
