from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .analytics import dashboard_stats, facility_analytics, person_demographics
from .auth_views import (
    LoginView,
    check_auth_view,
    logout_view,
    profile_view,
    register_view,
)
from .views import (
    EmployeeDetailView,
    EmployeeListCreateView,
    EmploymentDetailView,
    EmploymentListCreateView,
    FacilityDetailView,
    FacilityListCreateView,
    InfectionDetailView,
    InfectionListCreateView,
    InfectionTypeDetailView,
    InfectionTypeListCreateView,
    PersonDetailView,
    PersonListCreateView,
    ResidenceDetailView,
    ResidenceListCreateView,
    ScheduleDetailView,
    ScheduleListCreateView,
    VaccinationDetailView,
    VaccinationListCreateView,
    VaccineTypeDetailView,
    VaccineTypeListCreateView,
    employee_filter_options,
    person_filter_options,
)

urlpatterns = [
    # Authentication endpoints (JWT)
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/logout/", logout_view, name="logout"),
    path("auth/profile/", profile_view, name="profile"),
    path("auth/register/", register_view, name="register"),
    path("auth/check/", check_auth_view, name="check-auth"),
    # Filter options endpoints (must come before detail endpoints)
    path(
        "persons/filter-options/", person_filter_options, name="person-filter-options"
    ),
    path(
        "employees/filter-options/",
        employee_filter_options,
        name="employee-filter-options",
    ),
    # Person endpoints (URL identifier is Person.uuid; Medicare/SSN never appear)
    path("persons/", PersonListCreateView.as_view(), name="person-list-create"),
    path("persons/<uuid:uuid>/", PersonDetailView.as_view(), name="person-detail"),
    # Employee endpoints (lookup via Person.uuid through the OneToOne)
    path("employees/", EmployeeListCreateView.as_view(), name="employee-list-create"),
    path(
        "employees/<uuid:uuid>/",
        EmployeeDetailView.as_view(),
        name="employee-detail",
    ),
    # Facility endpoints
    path("facilities/", FacilityListCreateView.as_view(), name="facility-list-create"),
    path(
        "facilities/<int:pk>/", FacilityDetailView.as_view(), name="facility-detail"
    ),  # FID is int
    # Analytics endpoints
    path("analytics/dashboard/", dashboard_stats, name="dashboard-stats"),
    path("analytics/facilities/", facility_analytics, name="facility-analytics"),
    path("analytics/demographics/", person_demographics, name="person-demographics"),
    # Residence endpoints
    path(
        "residences/", ResidenceListCreateView.as_view(), name="residence-list-create"
    ),
    path(
        "residences/<int:pk>/", ResidenceDetailView.as_view(), name="residence-detail"
    ),
    # Infection Type endpoints
    path(
        "infection-types/",
        InfectionTypeListCreateView.as_view(),
        name="infection-type-list-create",
    ),
    path(
        "infection-types/<int:pk>/",
        InfectionTypeDetailView.as_view(),
        name="infection-type-detail",
    ),
    # Infection endpoints (composite PK; URL exposes person.uuid, not SSN)
    path(
        "infections/", InfectionListCreateView.as_view(), name="infection-list-create"
    ),
    path(
        "infections/<uuid:person_uuid>/<str:date>/<int:type_id>/",
        InfectionDetailView.as_view(),
        name="infection-detail",
    ),
    # Vaccine Type endpoints
    path(
        "vaccine-types/",
        VaccineTypeListCreateView.as_view(),
        name="vaccine-type-list-create",
    ),
    path(
        "vaccine-types/<int:pk>/",
        VaccineTypeDetailView.as_view(),
        name="vaccine-type-detail",
    ),
    # Vaccination endpoints (composite PK; URL exposes person.uuid, not SSN)
    path(
        "vaccinations/",
        VaccinationListCreateView.as_view(),
        name="vaccination-list-create",
    ),
    path(
        "vaccinations/<uuid:person_uuid>/<int:type_id>/<str:date>/",
        VaccinationDetailView.as_view(),
        name="vaccination-detail",
    ),
    # Employment endpoints (composite PK; URL exposes person.uuid, not ESSN)
    path(
        "employments/",
        EmploymentListCreateView.as_view(),
        name="employment-list-create",
    ),
    path(
        "employments/<uuid:person_uuid>/<int:fid>/<str:start_date>/",
        EmploymentDetailView.as_view(),
        name="employment-detail",
    ),
    # Schedule endpoints (composite PK; URL exposes person.uuid, not ESSN)
    path("schedules/", ScheduleListCreateView.as_view(), name="schedule-list-create"),
    path(
        "schedules/<uuid:person_uuid>/<int:fid>/<str:date>/<str:start_time>/",
        ScheduleDetailView.as_view(),
        name="schedule-detail",
    ),
]
