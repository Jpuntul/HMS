from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    return JsonResponse(
        {
            "message": "HMS API Server",
            "version": "1.0.0",
            "endpoints": {
                "admin": "/admin/",
                "api": "/api/",
                "persons": "/api/persons/",
                "person_detail": "/api/persons/{id}/",
            },
        }
    )


urlpatterns = [
    path("", api_root, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/", include("hms.app_urls")),
]
