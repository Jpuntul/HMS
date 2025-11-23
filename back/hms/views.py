from rest_framework import generics
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import (
    Person,
    Employee,
    Facility,
    Residence,
    InfectionType,
    Infection,
    VaccineType,
    Vaccination,
    Employment,
    Schedule,
)
from .serializers import (
    PersonSerializer,
    EmployeeSerializer,
    FacilitySerializer,
    ResidenceSerializer,
    InfectionTypeSerializer,
    InfectionSerializer,
    VaccineTypeSerializer,
    VaccinationSerializer,
    EmploymentSerializer,
    ScheduleSerializer,
)


class PersonListCreateView(generics.ListCreateAPIView):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
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
    permission_classes = [IsAuthenticatedOrReadOnly]


class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["role"]
    ordering_fields = ["ssn", "role"]
    ordering = ["ssn"]

    def get_queryset(self):
        queryset = Employee.objects.all()
        search = self.request.query_params.get("search", None)
        if search:
            # Search in related person data
            queryset = queryset.filter(
                Q(ssn__icontains=search) | Q(role__icontains=search)
            )
            # Also search in related person fields
            try:
                person_queryset = Person.objects.filter(
                    Q(first_name__icontains=search)
                    | Q(last_name__icontains=search)
                    | Q(email__icontains=search)
                )
                person_ssns = person_queryset.values_list("ssn", flat=True)
                queryset = queryset.filter(
                    Q(ssn__in=person_ssns)
                    | Q(ssn__icontains=search)
                    | Q(role__icontains=search)
                )
            except:
                pass
        return queryset


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class FacilityListCreateView(generics.ListCreateAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ["name", "address", "city", "type", "phone_number"]
    filterset_fields = ["type", "city", "province"]
    ordering_fields = ["name", "type", "capacity", "city"]
    ordering = ["name"]


class FacilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# Residence Views
class ResidenceListCreateView(generics.ListCreateAPIView):
    queryset = Residence.objects.all()
    serializer_class = ResidenceSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ["address", "city", "province", "postal_code"]
    filterset_fields = ["type", "city", "province"]
    ordering_fields = ["city", "type", "no_of_bedrooms"]
    ordering = ["city"]


class ResidenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Residence.objects.all()
    serializer_class = ResidenceSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# Infection Type Views
class InfectionTypeListCreateView(generics.ListCreateAPIView):
    queryset = InfectionType.objects.all()
    serializer_class = InfectionTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["type_name"]
    ordering = ["type_name"]


class InfectionTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InfectionType.objects.all()
    serializer_class = InfectionTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# Infection Views
class InfectionListCreateView(generics.ListCreateAPIView):
    queryset = Infection.objects.all()
    serializer_class = InfectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["ssn", "type_id", "date"]
    ordering_fields = ["date", "ssn"]
    ordering = ["-date"]


class InfectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Infection.objects.all()
    serializer_class = InfectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# Vaccine Type Views
class VaccineTypeListCreateView(generics.ListCreateAPIView):
    queryset = VaccineType.objects.all()
    serializer_class = VaccineTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["type_name"]
    ordering = ["type_name"]


class VaccineTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VaccineType.objects.all()
    serializer_class = VaccineTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# Vaccination Views
class VaccinationListCreateView(generics.ListCreateAPIView):
    queryset = Vaccination.objects.all()
    serializer_class = VaccinationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["ssn", "type_id", "fid", "no_of_dose"]
    ordering_fields = ["date", "ssn"]
    ordering = ["-date"]


class VaccinationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vaccination.objects.all()
    serializer_class = VaccinationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# Employment Views
class EmploymentListCreateView(generics.ListCreateAPIView):
    queryset = Employment.objects.all()
    serializer_class = EmploymentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["essn", "fid"]
    ordering_fields = ["start_date", "end_date"]
    ordering = ["-start_date"]


class EmploymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employment.objects.all()
    serializer_class = EmploymentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# Schedule Views
class ScheduleListCreateView(generics.ListCreateAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["essn", "fid", "date"]
    ordering_fields = ["date", "start_time"]
    ordering = ["date", "start_time"]


class ScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
