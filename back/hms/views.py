from rest_framework import generics
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Person, Employee, Facility
from .serializers import PersonSerializer, EmployeeSerializer, FacilitySerializer


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


class EmployeeListCreateView(generics.ListCreateAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
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


class FacilityListCreateView(generics.ListCreateAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ["name", "address", "city", "type", "phone_number"]
    filterset_fields = ["type", "city", "province"]
    ordering_fields = ["name", "type", "capacity", "city"]
    ordering = ["name"]


class FacilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
