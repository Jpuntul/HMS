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
