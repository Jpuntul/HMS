from django.db import models


class Person(models.Model):
    ssn = models.CharField(max_length=9, unique=True)
    medicare = models.CharField(max_length=12, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    dob = models.DateField()
    telephone = models.CharField(max_length=10, blank=True, null=True)
    citizenship = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField(max_length=320, blank=True, null=True)
    occupation = models.CharField(max_length=30, blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
