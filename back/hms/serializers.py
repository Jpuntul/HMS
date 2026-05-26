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
    uuid = serializers.UUIDField(source="person.uuid", read_only=True)
    ssn = serializers.IntegerField(source="person_id", read_only=True)
    person_name = serializers.SerializerMethodField()
    person_email = serializers.CharField(source="person.email", read_only=True)
    person_phone = serializers.CharField(source="person.telephone", read_only=True)

    class Meta:
        model = Employee
        fields = ["uuid", "ssn", "role", "person_name", "person_email", "person_phone"]

    def get_person_name(self, obj):
        p = obj.person
        return f"{p.first_name} {p.last_name}" if p else "Unknown"


class FacilitySerializer(serializers.ModelSerializer):
    gmssn = serializers.IntegerField(source="general_manager_id", read_only=True)
    general_manager_name = serializers.SerializerMethodField()

    class Meta:
        model = Facility
        fields = [
            "fid",
            "name",
            "address",
            "city",
            "province",
            "postal_code",
            "phone_number",
            "web_address",
            "type",
            "capacity",
            "gmssn",
            "general_manager",
            "general_manager_name",
        ]

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
    person_uuid = serializers.UUIDField(source="person.uuid", read_only=True)
    ssn = serializers.IntegerField(source="person_id")
    type_id = serializers.IntegerField(source="infection_type_id")
    person_name = serializers.SerializerMethodField()
    infection_type_name = serializers.CharField(
        source="infection_type.type_name", read_only=True
    )

    class Meta:
        model = Infection
        fields = [
            "person_uuid",
            "ssn",
            "date",
            "type_id",
            "person_name",
            "infection_type_name",
        ]

    def get_person_name(self, obj):
        p = obj.person
        return f"{p.first_name} {p.last_name}" if p else "Unknown"


class VaccineTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaccineType
        fields = "__all__"


class VaccinationSerializer(serializers.ModelSerializer):
    person_uuid = serializers.UUIDField(source="person.uuid", read_only=True)
    ssn = serializers.IntegerField(source="person_id")
    type_id = serializers.IntegerField(source="vaccine_type_id")
    fid = serializers.IntegerField(
        source="facility_id", allow_null=True, required=False
    )
    person_name = serializers.SerializerMethodField()
    vaccine_type_name = serializers.CharField(
        source="vaccine_type.type_name", read_only=True
    )
    facility_name = serializers.CharField(source="facility.name", read_only=True)

    class Meta:
        model = Vaccination
        fields = [
            "person_uuid",
            "ssn",
            "type_id",
            "date",
            "no_of_dose",
            "fid",
            "person_name",
            "vaccine_type_name",
            "facility_name",
        ]

    def get_person_name(self, obj):
        p = obj.person
        return f"{p.first_name} {p.last_name}" if p else "Unknown"


class EmploymentSerializer(serializers.ModelSerializer):
    person_uuid = serializers.UUIDField(source="employee.person.uuid", read_only=True)
    essn = serializers.IntegerField(source="employee_id")
    fid = serializers.IntegerField(source="facility_id")
    employee_name = serializers.SerializerMethodField()
    facility_name = serializers.CharField(source="facility.name", read_only=True)
    employee_role = serializers.CharField(source="employee.role", read_only=True)

    class Meta:
        model = Employment
        fields = [
            "person_uuid",
            "essn",
            "fid",
            "start_date",
            "end_date",
            "employee_name",
            "facility_name",
            "employee_role",
        ]

    def get_employee_name(self, obj):
        if obj.employee and obj.employee.person:
            p = obj.employee.person
            return f"{p.first_name} {p.last_name}"
        return "Unknown"


class ScheduleSerializer(serializers.ModelSerializer):
    person_uuid = serializers.UUIDField(source="employee.person.uuid", read_only=True)
    essn = serializers.IntegerField(source="employee_id")
    fid = serializers.IntegerField(source="facility_id")
    employee_name = serializers.SerializerMethodField()
    facility_name = serializers.CharField(source="facility.name", read_only=True)
    employee_role = serializers.CharField(source="employee.role", read_only=True)

    class Meta:
        model = Schedule
        fields = [
            "person_uuid",
            "essn",
            "fid",
            "date",
            "start_time",
            "end_time",
            "employee_name",
            "facility_name",
            "employee_role",
        ]

    def get_employee_name(self, obj):
        if obj.employee and obj.employee.person:
            p = obj.employee.person
            return f"{p.first_name} {p.last_name}"
        return "Unknown"
