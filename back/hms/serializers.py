from rest_framework import serializers
from .models import Person, Employee, Facility


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = "__all__"


class EmployeeSerializer(serializers.ModelSerializer):
    # Include person details in the response
    person_name = serializers.SerializerMethodField()
    person_email = serializers.SerializerMethodField()
    person_phone = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = "__all__"

    def get_person_name(self, obj):
        person = obj.person
        return f"{person.first_name} {person.last_name}" if person else "Unknown"

    def get_person_email(self, obj):
        person = obj.person
        return person.email if person else None

    def get_person_phone(self, obj):
        person = obj.person
        return person.telephone if person else None


class FacilitySerializer(serializers.ModelSerializer):
    # Include general manager details
    general_manager_name = serializers.SerializerMethodField()

    class Meta:
        model = Facility
        fields = "__all__"

    def get_general_manager_name(self, obj):
        gm = obj.general_manager
        return f"{gm.first_name} {gm.last_name}" if gm else "Unknown"
