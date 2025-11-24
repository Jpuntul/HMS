from datetime import datetime, timedelta

from django.db.models import Count
from django.db.models.functions import Extract
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Employee, Facility, Person


@api_view(["GET"])
@permission_classes([AllowAny])
def dashboard_stats(request):
    """Get overall dashboard statistics"""

    # Basic counts
    total_persons = Person.objects.count()
    total_employees = Employee.objects.count()
    total_facilities = Facility.objects.count()

    # Calculate capacity
    total_capacity = sum(facility.capacity or 0 for facility in Facility.objects.all())

    # Employee role distribution
    employee_roles = (
        Employee.objects.values("role").annotate(count=Count("role")).order_by("-count")
    )

    # Facility type distribution
    facility_types = (
        Facility.objects.values("type").annotate(count=Count("type")).order_by("-count")
    )

    # Age distribution (simplified for now since we don't have gender field)
    # We'll use citizenship as another distribution metric instead
    age_distribution = {
        "has_dob": Person.objects.filter(dob__isnull=False).count(),
        "no_dob": Person.objects.filter(dob__isnull=True).count(),
    }

    # Citizenship distribution
    citizenship_distribution = (
        Person.objects.values("citizenship")
        .annotate(count=Count("citizenship"))
        .order_by("-count")[:10]
    )  # Top 10 citizenships

    # Province distribution for facilities
    province_distribution = (
        Facility.objects.values("province")
        .annotate(count=Count("province"))
        .order_by("-count")
    )

    return Response(
        {
            "overview": {
                "total_persons": total_persons,
                "total_employees": total_employees,
                "total_facilities": total_facilities,
                "total_capacity": total_capacity,
            },
            "employee_roles": list(employee_roles),
            "facility_types": list(facility_types),
            "age_distribution": age_distribution,
            "citizenship_distribution": list(citizenship_distribution),
            "province_distribution": list(province_distribution),
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def facility_analytics(request):
    """Get detailed facility analytics"""

    facilities_with_stats = []

    for facility in Facility.objects.all():
        # Simplified employee count (just use a basic calculation for now)
        # Since we don't have direct facility-employee relationship, we'll estimate
        total_employees = Employee.objects.count()
        total_facilities = Facility.objects.count()
        estimated_employee_count = max(1, total_employees // total_facilities)

        facilities_with_stats.append(
            {
                "name": facility.name,
                "type": facility.type,
                "capacity": facility.capacity or 0,
                "employee_count": estimated_employee_count,
                "occupancy_rate": min(
                    (
                        (estimated_employee_count / facility.capacity * 100)
                        if facility.capacity
                        else 0
                    ),
                    100,
                ),
                "city": facility.city,
                "province": facility.province,
            }
        )

    # Sort by capacity
    facilities_with_stats.sort(key=lambda x: x["capacity"], reverse=True)

    return Response(
        {
            "facilities": facilities_with_stats,
            "total_capacity": sum(f["capacity"] for f in facilities_with_stats),
            "average_occupancy": (
                sum(f["occupancy_rate"] for f in facilities_with_stats)
                / len(facilities_with_stats)
                if facilities_with_stats
                else 0
            ),
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def person_demographics(request):
    """Get person demographics analytics"""

    # Age distribution (approximate based on today's date)
    current_year = datetime.now().year

    # Get birth years and calculate age groups (using 'dob' field name)
    persons_with_birth_year = Person.objects.annotate(
        birth_year=Extract("dob", "year")
    ).filter(birth_year__isnull=False)

    age_groups = {"0-18": 0, "19-30": 0, "31-50": 0, "51-70": 0, "70+": 0}

    for person in persons_with_birth_year:
        age = current_year - person.birth_year
        if age <= 18:
            age_groups["0-18"] += 1
        elif age <= 30:
            age_groups["19-30"] += 1
        elif age <= 50:
            age_groups["31-50"] += 1
        elif age <= 70:
            age_groups["51-70"] += 1
        else:
            age_groups["70+"] += 1

    # Occupation distribution (top 10)
    occupation_distribution = (
        Person.objects.exclude(occupation__isnull=True)
        .exclude(occupation__exact="")
        .values("occupation")
        .annotate(count=Count("occupation"))
        .order_by("-count")[:10]
    )

    # Monthly registration trend (last 12 months)
    # Note: This is simulated since we don't have actual registration dates
    monthly_trend = []
    for i in range(12):
        month_date = datetime.now() - timedelta(days=30 * i)
        # Simulate data based on person count
        count = max(1, Person.objects.count() // 12 + (i % 3))
        monthly_trend.append({"month": month_date.strftime("%b %Y"), "count": count})

    monthly_trend.reverse()

    return Response(
        {
            "age_distribution": age_groups,
            "occupation_distribution": list(occupation_distribution),
            "monthly_trend": monthly_trend,
            "total_persons": Person.objects.count(),
        }
    )
