from rest_framework import serializers

from .models import (
    Employee,
    Employment,
    Facility,
    Infection,
    InfectionType,
    Person,
    Residence,
    Schedule,
    Vaccination,
    VaccineType,
)


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


class ResidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Residence
        fields = "__all__"


class InfectionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfectionType
        fields = "__all__"


class InfectionSerializer(serializers.ModelSerializer):
    person_name = serializers.SerializerMethodField()
    infection_type_name = serializers.SerializerMethodField()

    class Meta:
        model = Infection
        fields = "__all__"

    def get_person_name(self, obj):
        person = obj.person
        return f"{person.first_name} {person.last_name}" if person else "Unknown"

    def get_infection_type_name(self, obj):
        infection_type = obj.infection_type
        return infection_type.type_name if infection_type else "Unknown"


class VaccineTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaccineType
        fields = "__all__"


class VaccinationSerializer(serializers.ModelSerializer):
    person_name = serializers.SerializerMethodField()
    vaccine_type_name = serializers.SerializerMethodField()
    facility_name = serializers.SerializerMethodField()

    class Meta:
        model = Vaccination
        fields = "__all__"

    def get_person_name(self, obj):
        person = obj.person
        return f"{person.first_name} {person.last_name}" if person else "Unknown"

    def get_vaccine_type_name(self, obj):
        vaccine_type = obj.vaccine_type
        return vaccine_type.type_name if vaccine_type else "Unknown"

    def get_facility_name(self, obj):
        facility = obj.facility
        return facility.name if facility else "Unknown"


class EmploymentSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    facility_name = serializers.SerializerMethodField()
    employee_role = serializers.SerializerMethodField()

    class Meta:
        model = Employment
        fields = "__all__"

    def get_employee_name(self, obj):
        employee = obj.employee
        if employee and employee.person:
            person = employee.person
            return f"{person.first_name} {person.last_name}"
        return "Unknown"

    def get_facility_name(self, obj):
        facility = obj.facility
        return facility.name if facility else "Unknown"

    def get_employee_role(self, obj):
        employee = obj.employee
        return employee.role if employee else "Unknown"


class ScheduleSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    facility_name = serializers.SerializerMethodField()
    employee_role = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = "__all__"

    def get_employee_name(self, obj):
        employee = obj.employee
        if employee and employee.person:
            person = employee.person
            return f"{person.first_name} {person.last_name}"
        return "Unknown"

    def get_facility_name(self, obj):
        facility = obj.facility
        return facility.name if facility else "Unknown"

    def get_employee_role(self, obj):
        employee = obj.employee
        return employee.role if employee else "Unknown"
