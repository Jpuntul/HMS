from django.urls import path
from .views import (
    PersonListCreateView,
    PersonDetailView,
    EmployeeListCreateView,
    EmployeeDetailView,
    FacilityListCreateView,
    FacilityDetailView,
)
from .analytics import (
    dashboard_stats,
    facility_analytics,
    person_demographics,
)

urlpatterns = [
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
]
