from datetime import date

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Employee, Facility, Person, Vaccination


def _years_ago(years: int, today: date | None = None) -> date:
    """Date exactly `years` before today, leap-day safe (Feb 29 -> Feb 28)."""
    today = today or date.today()
    try:
        return today.replace(year=today.year - years)
    except ValueError:
        return today.replace(year=today.year - years, day=28)


@api_view(["GET"])
def dashboard_stats(request):
    """Get overall dashboard statistics.

    Was 10 sequential round-trips (a count per metric). Down to 6: every
    scalar count that shares a table with another metric is folded into that
    metric's aggregate query (person total + age split in one query, facility
    total + capacity sum in another), and the two remaining totals
    (employees, facilities-by-type's total) are derived in Python from a
    grouped query the endpoint needed anyway rather than issued as their own
    COUNT(*). citizenship_distribution and province_distribution stay
    separate - they're on different tables (Person vs Facility) and combining
    them would mean a raw SQL UNION for no real gain at this row count.
    """

    # Person total + age split in one round trip instead of three
    # (Person.count(), has_dob count, no_dob count).
    person_stats = Person.objects.aggregate(
        total=Count("pk"),
        has_dob=Count("pk", filter=Q(dob__isnull=False)),
        no_dob=Count("pk", filter=Q(dob__isnull=True)),
    )
    total_persons = person_stats["total"]
    age_distribution = {
        "has_dob": person_stats["has_dob"],
        "no_dob": person_stats["no_dob"],
    }

    # Facility total + capacity sum in one round trip instead of two.
    facility_stats = Facility.objects.aggregate(
        total=Count("fid"),
        total_capacity=Sum("capacity"),
    )
    total_facilities = facility_stats["total"]
    total_capacity = facility_stats["total_capacity"] or 0

    # Employee role distribution. total_employees is the sum of these
    # per-role counts rather than a separate Employee.objects.count() query.
    employee_roles = list(
        Employee.objects.values("role").annotate(count=Count("role")).order_by("-count")
    )
    total_employees = sum(row["count"] for row in employee_roles)

    # Facility type distribution.
    facility_types = list(
        Facility.objects.values("type").annotate(count=Count("type")).order_by("-count")
    )

    # Citizenship distribution (top 10).
    citizenship_distribution = list(
        Person.objects.values("citizenship")
        .annotate(count=Count("citizenship"))
        .order_by("-count")[:10]
    )

    # Province distribution for facilities.
    province_distribution = list(
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
            "employee_roles": employee_roles,
            "facility_types": facility_types,
            "age_distribution": age_distribution,
            "citizenship_distribution": citizenship_distribution,
            "province_distribution": province_distribution,
        }
    )


@api_view(["GET"])
def facility_analytics(request):
    """Get detailed facility analytics.

    Employee count per facility is derived from the Employments table: a row
    counts as 'current' when end_date is NULL or in the future. Distinct on
    employee to avoid double-counting rows with multiple start_dates.
    """
    today = date.today()
    current = Q(employments__end_date__isnull=True) | Q(employments__end_date__gt=today)
    facilities = Facility.objects.annotate(
        employee_count=Count("employments__employee", filter=current, distinct=True),
    )

    facilities_with_stats = [
        {
            "name": f.name,
            "type": f.type,
            "capacity": f.capacity or 0,
            "employee_count": f.employee_count,
            "occupancy_rate": (
                min((f.employee_count / f.capacity) * 100, 100) if f.capacity else 0
            ),
            "city": f.city,
            "province": f.province,
        }
        for f in facilities
    ]

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
def person_demographics(request):
    """Person demographics analytics.

    Age buckets are computed in SQL from date-of-birth boundaries rather than
    by subtracting birth years in Python. The old approach counted someone born
    in December as a full year older for most of the year.
    """
    # Bucket edges as concrete dates: a person is 19+ exactly when their DOB is
    # on or before today-minus-19-years.
    d19, d31, d51, d71 = (_years_ago(n) for n in (19, 31, 51, 71))

    age_distribution = Person.objects.filter(dob__isnull=False).aggregate(
        **{
            "0-18": Count("pk", filter=Q(dob__gt=d19)),
            "19-30": Count("pk", filter=Q(dob__lte=d19, dob__gt=d31)),
            "31-50": Count("pk", filter=Q(dob__lte=d31, dob__gt=d51)),
            "51-70": Count("pk", filter=Q(dob__lte=d51, dob__gt=d71)),
            "70+": Count("pk", filter=Q(dob__lte=d71)),
        }
    )

    # Occupation distribution (top 10)
    occupation_distribution = (
        Person.objects.exclude(occupation__isnull=True)
        .exclude(occupation__exact="")
        .values("occupation")
        .annotate(count=Count("occupation"))
        .order_by("-count")[:10]
    )

    # Vaccinations per month, most recent 12 months that actually contain data.
    #
    # This replaces a "monthly registration trend" that was fabricated - it
    # divided the person count by 12 and added `i % 3` for texture. `Persons`
    # has no registration/created timestamp, so that series could not be built
    # from real data at all. `Vaccinations.Date` is a real recorded date, so
    # the chart now reports something that happened.
    #
    # Anchored to the newest row rather than to today: this dataset ends in
    # 2024, so a rolling window from `date.today()` would always be empty.
    monthly_trend = [
        {"month": row["month"].strftime("%b %Y"), "count": row["count"]}
        for row in reversed(
            list(
                Vaccination.objects.filter(date__isnull=False)
                .annotate(month=TruncMonth("date"))
                .values("month")
                .annotate(count=Count("pk"))
                .order_by("-month")[:12]
            )
        )
    ]

    return Response(
        {
            "age_distribution": age_distribution,
            "occupation_distribution": list(occupation_distribution),
            "monthly_trend": monthly_trend,
            "monthly_trend_metric": "vaccinations",
            "total_persons": Person.objects.count(),
        }
    )
