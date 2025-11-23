from django.urls import path
from .views import (
    PersonListCreateView,
    PersonDetailView,
    EmployeeListCreateView,
    EmployeeDetailView,
    FacilityListCreateView,
    FacilityDetailView,
    ResidenceListCreateView,
    ResidenceDetailView,
    InfectionTypeListCreateView,
    InfectionTypeDetailView,
    InfectionListCreateView,
    InfectionDetailView,
    VaccineTypeListCreateView,
    VaccineTypeDetailView,
    VaccinationListCreateView,
    VaccinationDetailView,
    EmploymentListCreateView,
    EmploymentDetailView,
    ScheduleListCreateView,
    ScheduleDetailView,
)
from .analytics import (
    dashboard_stats,
    facility_analytics,
    person_demographics,
)
from .auth_views import (
    login_view,
    logout_view,
    profile_view,
    register_view,
    check_auth_view,
)

urlpatterns = [
    # Authentication endpoints
    path("auth/login/", login_view, name="login"),
    path("auth/logout/", logout_view, name="logout"),
    path("auth/profile/", profile_view, name="profile"),
    path("auth/register/", register_view, name="register"),
    path("auth/check/", check_auth_view, name="check-auth"),
    # Person endpoints
    path("persons/", PersonListCreateView.as_view(), name="person-list-create"),
    path(
        "persons/<str:pk>/", PersonDetailView.as_view(), name="person-detail"
    ),  # Medicare is string
    # Employee endpoints
    path("employees/", EmployeeListCreateView.as_view(), name="employee-list-create"),
    path(
        "employees/<int:pk>/", EmployeeDetailView.as_view(), name="employee-detail"
    ),  # SSN is int
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
    # Infection endpoints
    path(
        "infections/", InfectionListCreateView.as_view(), name="infection-list-create"
    ),
    path(
        "infections/<int:pk>/", InfectionDetailView.as_view(), name="infection-detail"
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
    # Vaccination endpoints
    path(
        "vaccinations/",
        VaccinationListCreateView.as_view(),
        name="vaccination-list-create",
    ),
    path(
        "vaccinations/<int:pk>/",
        VaccinationDetailView.as_view(),
        name="vaccination-detail",
    ),
    # Employment endpoints
    path(
        "employments/",
        EmploymentListCreateView.as_view(),
        name="employment-list-create",
    ),
    path(
        "employments/<int:pk>/",
        EmploymentDetailView.as_view(),
        name="employment-detail",
    ),
    # Schedule endpoints
    path("schedules/", ScheduleListCreateView.as_view(), name="schedule-list-create"),
    path("schedules/<int:pk>/", ScheduleDetailView.as_view(), name="schedule-detail"),
]
