from django.urls import path
from .views import PersonListCreateView

urlpatterns = [
    path("persons/", PersonListCreateView.as_view(), name="person-list-create"),
]
