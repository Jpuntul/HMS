from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

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
from .serializers import (
    EmployeeSerializer,
    EmploymentSerializer,
    FacilitySerializer,
    InfectionSerializer,
    InfectionTypeSerializer,
    PersonSerializer,
    ResidenceSerializer,
    ScheduleSerializer,
    VaccinationSerializer,
    VaccineTypeSerializer,
)


class CompositeLookupMixin:
    """For detail views on tables with a CompositePrimaryKey.

    `composite_lookup_map` maps URL kwarg names to ORM filter expressions.
    """

    composite_lookup_map: dict[str, str] = {}

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup = {
            orm_key: self.kwargs[url_kwarg]
            for url_kwarg, orm_key in self.composite_lookup_map.items()
        }
        obj = get_object_or_404(queryset, **lookup)
        self.check_object_permissions(self.request, obj)
        return obj


class PersonListCreateView(generics.ListCreateAPIView):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = [
        "first_name",
        "last_name",
        "ssn",
        "medicare",
        "email",
        "occupation",
        "citizenship",
    ]
    filterset_fields = ["citizenship", "occupation"]
    ordering_fields = ["first_name", "last_name", "dob"]
    ordering = ["first_name", "last_name"]


class PersonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    lookup_field = "uuid"


class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = Employee.objects.select_related("person").all()
    serializer_class = EmployeeSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = [
        "person__ssn",
        "person__first_name",
        "person__last_name",
        "person__email",
        "role",
    ]
    filterset_fields = ["role"]
    ordering_fields = ["person", "role"]
    ordering = ["person"]


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.select_related("person").all()
    serializer_class = EmployeeSerializer
    # Lookup Employee via Person.uuid since Employee.person is the OneToOne PK.
    lookup_field = "person__uuid"
    lookup_url_kwarg = "uuid"


class FacilityListCreateView(generics.ListCreateAPIView):
    queryset = Facility.objects.select_related("general_manager").all()
    serializer_class = FacilitySerializer
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ["name", "address", "city", "type", "phone_number"]
    filterset_fields = ["type", "city", "province"]
    ordering_fields = ["name", "type", "capacity", "city"]
    ordering = ["name"]


class FacilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Facility.objects.select_related("general_manager").all()
    serializer_class = FacilitySerializer


class ResidenceListCreateView(generics.ListCreateAPIView):
    queryset = Residence.objects.all()
    serializer_class = ResidenceSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ["address", "city", "province", "postal_code"]
    filterset_fields = ["type", "city", "province"]
    ordering_fields = ["city", "type", "no_of_bedrooms"]
    ordering = ["city"]


class ResidenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Residence.objects.all()
    serializer_class = ResidenceSerializer


class InfectionTypeListCreateView(generics.ListCreateAPIView):
    queryset = InfectionType.objects.all()
    serializer_class = InfectionTypeSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["type_name"]
    ordering = ["type_name"]


class InfectionTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InfectionType.objects.all()
    serializer_class = InfectionTypeSerializer


class InfectionListCreateView(generics.ListCreateAPIView):
    queryset = Infection.objects.select_related("person", "infection_type").all()
    serializer_class = InfectionSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["person", "infection_type", "date"]
    ordering_fields = ["date", "person"]
    ordering = ["-date"]


class InfectionDetailView(CompositeLookupMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Infection.objects.select_related("person", "infection_type").all()
    serializer_class = InfectionSerializer
    composite_lookup_map = {
        "person_uuid": "person__uuid",
        "date": "date",
        "type_id": "infection_type_id",
    }


class VaccineTypeListCreateView(generics.ListCreateAPIView):
    queryset = VaccineType.objects.all()
    serializer_class = VaccineTypeSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["type_name"]
    ordering = ["type_name"]


class VaccineTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VaccineType.objects.all()
    serializer_class = VaccineTypeSerializer


class VaccinationListCreateView(generics.ListCreateAPIView):
    queryset = Vaccination.objects.select_related(
        "person", "vaccine_type", "facility"
    ).all()
    serializer_class = VaccinationSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["person", "vaccine_type", "facility", "no_of_dose"]
    ordering_fields = ["date", "person"]
    ordering = ["-date"]


class VaccinationDetailView(
    CompositeLookupMixin, generics.RetrieveUpdateDestroyAPIView
):
    queryset = Vaccination.objects.select_related(
        "person", "vaccine_type", "facility"
    ).all()
    serializer_class = VaccinationSerializer
    composite_lookup_map = {
        "person_uuid": "person__uuid",
        "type_id": "vaccine_type_id",
        "date": "date",
    }


class EmploymentListCreateView(generics.ListCreateAPIView):
    queryset = Employment.objects.select_related("employee__person", "facility").all()
    serializer_class = EmploymentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["employee", "facility"]
    ordering_fields = ["start_date", "end_date"]
    ordering = ["-start_date"]


class EmploymentDetailView(CompositeLookupMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Employment.objects.select_related("employee__person", "facility").all()
    serializer_class = EmploymentSerializer
    composite_lookup_map = {
        "person_uuid": "employee__person__uuid",
        "fid": "facility_id",
        "start_date": "start_date",
    }


class ScheduleListCreateView(generics.ListCreateAPIView):
    queryset = Schedule.objects.select_related("employee__person", "facility").all()
    serializer_class = ScheduleSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["employee", "facility", "date"]
    ordering_fields = ["date", "start_time"]
    ordering = ["date", "start_time"]


class ScheduleDetailView(CompositeLookupMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Schedule.objects.select_related("employee__person", "facility").all()
    serializer_class = ScheduleSerializer
    composite_lookup_map = {
        "person_uuid": "employee__person__uuid",
        "fid": "facility_id",
        "date": "date",
        "start_time": "start_time",
    }


@api_view(["GET"])
def person_filter_options(request):
    citizenships = (
        Person.objects.exclude(citizenship__isnull=True)
        .exclude(citizenship="")
        .values_list("citizenship", flat=True)
        .distinct()
        .order_by("citizenship")
    )
    occupations = (
        Person.objects.exclude(occupation__isnull=True)
        .exclude(occupation="")
        .values_list("occupation", flat=True)
        .distinct()
        .order_by("occupation")
    )
    return Response(
        {"citizenships": list(citizenships), "occupations": list(occupations)}
    )


@api_view(["GET"])
def employee_filter_options(request):
    roles = (
        Employee.objects.exclude(role__isnull=True)
        .exclude(role="")
        .values_list("role", flat=True)
        .distinct()
        .order_by("role")
    )
    return Response({"roles": list(roles)})
