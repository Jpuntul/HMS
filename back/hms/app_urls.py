from django.urls import path
from .views import PersonListCreateView, PersonDetailView

urlpatterns = [
    path("persons/", PersonListCreateView.as_view(), name="person-list-create"),
    path("persons/<int:pk>/", PersonDetailView.as_view(), name="person-detail"),
]
