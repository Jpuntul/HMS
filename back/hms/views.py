import django_filters
from django.db import transaction
from django.db.models import CharField, Value
from django.db.models.functions import Concat
from django.shortcuts import get_object_or_404
from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from .models import (
    AuditLogEntry,
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


def _full_name(prefix: str):
    """`Concat(<prefix>__first_name, ' ', <prefix>__last_name)` as a queryset annotation.

    Computed in SQL rather than in each serializer's SerializerMethodField,
    so a list of N rows costs one string-concat expression per row done by
    MySQL instead of N Python string formats plus the attribute lookups
    needed to build them.
    """
    return Concat(
        f"{prefix}__first_name",
        Value(" "),
        f"{prefix}__last_name",
        output_field=CharField(),
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


class AuditLogMixin:
    """Writes one AuditLogEntry after each successful create/update/delete.

    Hooks DRF's perform_* methods rather than save()/delete() on the models
    themselves, so it only fires for API-driven writes (which is everything
    that matters here - there's no admin-panel or management-command write
    path for these models today) and stays out of models.py entirely.

    Logs *after* the underlying operation succeeds, never before - a failed
    write must not produce a log entry claiming it happened.
    """

    def perform_create(self, serializer):
        # atomic: the write and its audit row commit together, or neither
        # does. Without this, a create that succeeds followed by an
        # AuditLogEntry.objects.create() that fails (DB blip, constraint)
        # leaves a write with no audit trail - exactly the gap audit logging
        # exists to close.
        with transaction.atomic():
            super().perform_create(serializer)
            self._log("create", serializer.instance)

    def perform_update(self, serializer):
        with transaction.atomic():
            super().perform_update(serializer)
            self._log("update", serializer.instance)

    def perform_destroy(self, instance):
        # Capture identity before super() runs: a hard delete removes the
        # row (nothing left to introspect after), and even a soft delete
        # mutates the instance mid-flight.
        model_name = instance.__class__.__name__
        object_pk = str(instance.pk)
        object_repr = str(instance)[:200]
        with transaction.atomic():
            super().perform_destroy(instance)
            AuditLogEntry.objects.create(
                actor=self.request.user if self.request.user.is_authenticated else None,
                action="delete",
                model_name=model_name,
                object_pk=object_pk,
                object_repr=object_repr,
            )

    def _log(self, action, instance):
        AuditLogEntry.objects.create(
            actor=self.request.user if self.request.user.is_authenticated else None,
            action=action,
            model_name=instance.__class__.__name__,
            object_pk=str(instance.pk),
            object_repr=str(instance)[:200],
        )


class PersonListCreateView(AuditLogMixin, generics.ListCreateAPIView):
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


class PersonDetailView(AuditLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    lookup_field = "uuid"


class EmployeeListCreateView(AuditLogMixin, generics.ListCreateAPIView):
    queryset = Employee.objects.select_related("person").annotate(
        person_name=_full_name("person")
    )
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


class EmployeeDetailView(AuditLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.select_related("person").annotate(
        person_name=_full_name("person")
    )
    serializer_class = EmployeeSerializer
    # Lookup Employee via Person.uuid since Employee.person is the OneToOne PK.
    lookup_field = "person__uuid"
    lookup_url_kwarg = "uuid"


class FacilityListCreateView(AuditLogMixin, generics.ListCreateAPIView):
    queryset = Facility.objects.select_related("general_manager").annotate(
        general_manager_name=_full_name("general_manager")
    )
    serializer_class = FacilitySerializer
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ["name", "address", "city", "type", "phone_number"]
    filterset_fields = ["type", "city", "province"]
    ordering_fields = ["name", "type", "capacity", "city"]
    ordering = ["name"]


class FacilityDetailView(AuditLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Facility.objects.select_related("general_manager").annotate(
        general_manager_name=_full_name("general_manager")
    )
    serializer_class = FacilitySerializer


class ResidenceListCreateView(AuditLogMixin, generics.ListCreateAPIView):
    queryset = Residence.objects.all()
    serializer_class = ResidenceSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ["address", "city", "province", "postal_code"]
    filterset_fields = ["type", "city", "province"]
    ordering_fields = ["city", "type", "no_of_bedrooms"]
    ordering = ["city"]


class ResidenceDetailView(AuditLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Residence.objects.all()
    serializer_class = ResidenceSerializer


class InfectionTypeListCreateView(AuditLogMixin, generics.ListCreateAPIView):
    queryset = InfectionType.objects.all()
    serializer_class = InfectionTypeSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["type_name"]
    ordering = ["type_name"]


class InfectionTypeDetailView(AuditLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = InfectionType.objects.all()
    serializer_class = InfectionTypeSerializer


class InfectionListCreateView(AuditLogMixin, generics.ListCreateAPIView):
    queryset = Infection.objects.select_related("person", "infection_type").annotate(
        person_name=_full_name("person")
    )
    serializer_class = InfectionSerializer
    # SearchFilter was missing: the UI sends `?search=` and DRF silently
    # dropped it, returning every row as if the term had matched everything.
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = [
        "person__first_name",
        "person__last_name",
        "infection_type__type_name",
    ]
    filterset_fields = ["person", "infection_type", "date"]
    ordering_fields = ["date", "person"]
    ordering = ["-date"]


class InfectionDetailView(
    CompositeLookupMixin, AuditLogMixin, generics.RetrieveUpdateDestroyAPIView
):
    queryset = Infection.objects.select_related("person", "infection_type").annotate(
        person_name=_full_name("person")
    )
    serializer_class = InfectionSerializer
    composite_lookup_map = {
        "person_uuid": "person__uuid",
        "date": "date",
        "type_id": "infection_type_id",
    }


class VaccineTypeListCreateView(AuditLogMixin, generics.ListCreateAPIView):
    queryset = VaccineType.objects.all()
    serializer_class = VaccineTypeSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["type_name"]
    ordering = ["type_name"]


class VaccineTypeDetailView(AuditLogMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = VaccineType.objects.all()
    serializer_class = VaccineTypeSerializer


class VaccinationListCreateView(AuditLogMixin, generics.ListCreateAPIView):
    queryset = Vaccination.objects.select_related(
        "person", "vaccine_type", "facility"
    ).annotate(person_name=_full_name("person"))
    serializer_class = VaccinationSerializer
    # SearchFilter was missing here too - same silent-no-op as Infection.
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = [
        "person__first_name",
        "person__last_name",
        "vaccine_type__type_name",
        "facility__name",
    ]
    filterset_fields = ["person", "vaccine_type", "facility", "no_of_dose"]
    ordering_fields = ["date", "person"]
    ordering = ["-date"]


class VaccinationDetailView(
    CompositeLookupMixin, AuditLogMixin, generics.RetrieveUpdateDestroyAPIView
):
    queryset = Vaccination.objects.select_related(
        "person", "vaccine_type", "facility"
    ).annotate(person_name=_full_name("person"))
    serializer_class = VaccinationSerializer
    composite_lookup_map = {
        "person_uuid": "person__uuid",
        "type_id": "vaccine_type_id",
        "date": "date",
    }


class EmploymentListCreateView(AuditLogMixin, generics.ListCreateAPIView):
    queryset = Employment.objects.select_related(
        "employee__person", "facility"
    ).annotate(employee_name=_full_name("employee__person"))
    serializer_class = EmploymentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["employee", "facility"]
    ordering_fields = ["start_date", "end_date"]
    ordering = ["-start_date"]


class EmploymentDetailView(
    CompositeLookupMixin, AuditLogMixin, generics.RetrieveUpdateDestroyAPIView
):
    queryset = Employment.objects.select_related(
        "employee__person", "facility"
    ).annotate(employee_name=_full_name("employee__person"))
    serializer_class = EmploymentSerializer
    composite_lookup_map = {
        "person_uuid": "employee__person__uuid",
        "fid": "facility_id",
        "start_date": "start_date",
    }


class ScheduleFilterSet(django_filters.FilterSet):
    # The frontend sends `?role=`, but role lives on Employee, not Schedule -
    # `filterset_fields` can't rename a traversed field's query param, so this
    # needs an explicit FilterSet.
    role = django_filters.CharFilter(field_name="employee__role")

    class Meta:
        model = Schedule
        fields = ["employee", "facility", "date", "role"]


class ScheduleListCreateView(AuditLogMixin, generics.ListCreateAPIView):
    queryset = Schedule.objects.select_related("employee__person", "facility").annotate(
        employee_name=_full_name("employee__person")
    )
    serializer_class = ScheduleSerializer
    # Narrowed to the employee's name only (not facility/role/free text):
    # the Schedules index added alongside this only covers
    # (DeletedAt, Date, StartTime), not this join, so keeping search_fields
    # small keeps the join side of the query cheap even though the base scan
    # is now indexed.
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = ["employee__person__first_name", "employee__person__last_name"]
    filterset_class = ScheduleFilterSet
    ordering_fields = ["date", "start_time"]
    ordering = ["date", "start_time"]


class ScheduleDetailView(
    CompositeLookupMixin, AuditLogMixin, generics.RetrieveUpdateDestroyAPIView
):
    queryset = Schedule.objects.select_related("employee__person", "facility").annotate(
        employee_name=_full_name("employee__person")
    )
    serializer_class = ScheduleSerializer
    composite_lookup_map = {
        "person_uuid": "employee__person__uuid",
        "fid": "facility_id",
        "date": "date",
        "start_time": "start_time",
    }


# TTL 1 hour: these are reference-data dropdowns (distinct citizenships /
# occupations / roles), not per-user data - every authenticated caller gets
# the same answer, so a shared cache_page entry is safe. Uses the default
# Django cache backend (LocMemCache per settings.py); swap the backend in
# CACHES to change where this is stored without touching either view.
@cache_page(60 * 60)
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


@cache_page(60 * 60)
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
