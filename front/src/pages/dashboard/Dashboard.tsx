import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
);

interface DashboardStats {
  overview: {
    total_persons: number;
    total_employees: number;
    total_facilities: number;
    total_capacity: number;
  };
  employee_roles: Array<{ role: string; count: number }>;
  facility_types: Array<{ type: string; count: number }>;
  age_distribution: { has_dob: number; no_dob: number };
  citizenship_distribution: Array<{ citizenship: string; count: number }>;
  province_distribution: Array<{ province: string; count: number }>;
}

interface PersonDemographics {
  age_distribution: { [key: string]: number };
  occupation_distribution: Array<{ occupation: string; count: number }>;
  monthly_trend: Array<{ month: string; count: number }>;
  total_persons: number;
}

interface FacilityAnalytics {
  facilities: Array<{
    name: string;
    type: string;
    capacity: number;
    employee_count: number;
    occupancy_rate: number;
    city: string;
    province: string;
  }>;
  total_capacity: number;
  average_occupancy: number;
}

interface HealthStats {
  infections: Array<{
    ssn: number;
    date: string;
    type_id: number;
    infection_type_name: string;
  }>;
  vaccinations: Array<{
    ssn: number;
    date: string;
    type_id: number;
    vaccine_type_name: string;
    no_of_dose: number;
  }>;
  schedules: Array<{
    essn: number;
    date: string;
    fid: number;
  }>;
}

// Chart palette drawn from the Access & Roster tokens - replaces the
// previous rainbow of stock hex codes. No color here is chosen for
// variety; each slot is picked so adjacent wedges/bars stay
// distinguishable at a glance.
const CHART_PALETTE = [
  "#34383f", // ink
  "#a8382c", // stamp-red
  "#2c7350", // verified-green
  "#9c7112", // pending-amber
  "#7a7e85", // ink-soft
  "#21847a", // role-nurse (teal)
  "#2c4c82", // role-doctor (steel blue)
  "#6a4a8f", // role-pharmacist (violet)
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: "#34383f",
        font: { family: "Space Grotesk", size: 12 },
        boxWidth: 12,
        padding: 12,
      },
    },
  },
  scales: undefined as unknown,
};

const barLineScales = {
  x: {
    ticks: { color: "#7a7e85", font: { family: "Space Grotesk", size: 11 } },
    grid: { color: "#e2e0d6" },
  },
  y: {
    ticks: { color: "#7a7e85", font: { family: "Space Grotesk", size: 11 } },
    grid: { color: "#e2e0d6" },
  },
};

// Real role strings from Employee.role (see PRODUCT.md) mapped to a
// compact badge abbreviation and a role color from the design tokens.
// Abbreviation only - never a fabricated clinical role beyond what the
// record itself says.
const ROLE_META: Record<string, { abbr: string; color: string }> = {
  nurse: { abbr: "RN", color: "var(--color-role-nurse)" },
  doctor: { abbr: "MD", color: "var(--color-role-doctor)" },
  pharmacist: { abbr: "RPH", color: "var(--color-role-pharmacist)" },
  receptionist: { abbr: "REC", color: "var(--color-role-security)" },
  "administrative personnel": {
    abbr: "ADM",
    color: "var(--color-role-admin)",
  },
  "security personnel": { abbr: "SEC", color: "var(--color-role-security)" },
  cashier: { abbr: "CSH", color: "var(--color-role-cashier)" },
  "regular employee": { abbr: "EMP", color: "var(--color-role-regular)" },
};

function roleMeta(role: string): { abbr: string; color: string } {
  return (
    ROLE_META[role.toLowerCase()] ?? {
      abbr: role.slice(0, 3).toUpperCase(),
      color: "var(--color-role-regular)",
    }
  );
}

/** A bordered ledger panel - the page's recurring container for charts and tables. */
const FormPanel: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = "" }) => (
  <div
    className={`overflow-hidden rounded border-[1.5px] border-ink bg-panel ${className}`}
  >
    <div className="border-b border-paper-line px-5 py-3">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/** One tabular-mono figure in the system-counts ledger line. */
const Metric: React.FC<{
  value: string | number;
  label: string;
  urgent?: boolean;
}> = ({ value, label, urgent }) => (
  <div className="min-w-[120px] flex-1 border-r border-paper-line px-5 py-3.5 last:border-r-0">
    <div
      className={`font-mono text-xl font-bold tabular-nums sm:text-2xl ${
        urgent ? "text-stamp-red-ink" : "text-ink"
      }`}
    >
      {value}
    </div>
    <div className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-ink-soft">
      {label}
    </div>
  </div>
);

/** One ruled line-item on a census-style panel, tag-based (not a pastel pill). */
const CensusRow: React.FC<{
  label: string;
  value: string;
  note?: string;
  tag?: { label: string; color: string };
}> = ({ label, value, note, tag }) => (
  <div className="flex items-center justify-between gap-4 border-b border-paper-line py-3 last:border-b-0">
    <div>
      <div className="text-sm font-semibold text-ink-soft">{label}</div>
      {note && <div className="mt-0.5 text-xs text-ink-soft">{note}</div>}
    </div>
    <div className="flex items-center gap-3">
      {tag && (
        <span className="badge-tag" style={{ background: tag.color }}>
          {tag.label}
        </span>
      )}
      <span className="font-mono text-2xl font-bold tabular-nums text-ink">
        {value}
      </span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [demographics, setDemographics] = useState<PersonDemographics | null>(
    null,
  );
  const [facilityAnalytics, setFacilityAnalytics] =
    useState<FacilityAnalytics | null>(null);
  const [healthStats, setHealthStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        statsResponse,
        demographicsResponse,
        facilityResponse,
        infectionsResponse,
        vaccinationsResponse,
        schedulesResponse,
      ] = await Promise.all([
        axios.get(API_ENDPOINTS.analytics.dashboard),
        axios.get(API_ENDPOINTS.analytics.demographics),
        axios.get(API_ENDPOINTS.analytics.facilities),
        // Only fetch recent data for dashboard charts
        axios.get(`${API_ENDPOINTS.infections}?limit=200&ordering=-date`),
        axios.get(`${API_ENDPOINTS.vaccinations}?limit=200&ordering=-date`),
        axios.get(`${API_ENDPOINTS.schedules}?limit=100&ordering=-date`),
      ]);

      setDashboardStats(statsResponse.data);
      setDemographics(demographicsResponse.data);
      setFacilityAnalytics(facilityResponse.data);
      setHealthStats({
        infections: infectionsResponse.data.results || infectionsResponse.data,
        vaccinations:
          vaccinationsResponse.data.results || vaccinationsResponse.data,
        schedules: schedulesResponse.data.results || schedulesResponse.data,
      });
      setLoading(false);
    } catch {
      setError("Failed to fetch dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // These derived values and chart datasets used to live after the
  // loading/error early-returns below - reallocated (and every .map/.reduce
  // rerun) on every render, including re-renders that changed nothing they
  // depend on. Hooks can't run after an early return, so they're memoized
  // here instead, above it, with null-safe fallbacks for the
  // not-yet-loaded state.
  const totalInfections = healthStats?.infections.length ?? 0;
  const totalVaccinations = healthStats?.vaccinations.length ?? 0;

  const uniqueVaccinatedPeople = useMemo(
    () => new Set((healthStats?.vaccinations ?? []).map((v) => v.ssn)).size,
    [healthStats],
  );

  const vaccinationRate = useMemo(() => {
    const totalPersons = dashboardStats?.overview.total_persons ?? 0;
    return totalPersons > 0
      ? ((uniqueVaccinatedPeople / totalPersons) * 100).toFixed(1)
      : "0";
  }, [dashboardStats, uniqueVaccinatedPeople]);

  const recentInfections = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return (healthStats?.infections ?? []).filter(
      (inf) => new Date(inf.date) > thirtyDaysAgo,
    ).length;
  }, [healthStats]);

  const infectionTypeCount = useMemo(
    () =>
      (healthStats?.infections ?? []).reduce(
        (acc, inf) => {
          acc[inf.infection_type_name] =
            (acc[inf.infection_type_name] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [healthStats],
  );

  const vaccineTypeCount = useMemo(
    () =>
      (healthStats?.vaccinations ?? []).reduce(
        (acc, vac) => {
          acc[vac.vaccine_type_name] = (acc[vac.vaccine_type_name] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [healthStats],
  );

  const activeSchedules = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    return (healthStats?.schedules ?? []).filter((sch) => {
      const schDate = new Date(sch.date);
      return schDate >= weekStart && schDate <= weekEnd;
    }).length;
  }, [healthStats]);

  // Facilities at or over capacity - computed from real occupancy_rate,
  // not a fabricated count (direction contract: color/urgency is earned).
  const atCapacityCount = useMemo(
    () =>
      (facilityAnalytics?.facilities ?? []).filter(
        (f) => f.occupancy_rate >= 100,
      ).length,
    [facilityAnalytics],
  );

  const topFacilities = useMemo(
    () => (facilityAnalytics?.facilities ?? []).slice(0, 6),
    [facilityAnalytics],
  );

  const citizenshipRows = useMemo(() => {
    const total = dashboardStats?.overview.total_persons ?? 0;
    return (dashboardStats?.citizenship_distribution ?? [])
      .slice()
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((row) => ({
        ...row,
        pct: total > 0 ? ((row.count / total) * 100).toFixed(0) : "0",
      }));
  }, [dashboardStats]);

  const employeeRoleChartData = useMemo(
    () => ({
      labels: (dashboardStats?.employee_roles ?? []).map(
        (role) => role.role.charAt(0).toUpperCase() + role.role.slice(1),
      ),
      datasets: [
        {
          label: "Employee Count",
          data: (dashboardStats?.employee_roles ?? []).map(
            (role) => role.count,
          ),
          backgroundColor: CHART_PALETTE,
          borderWidth: 2,
          borderColor: "#f7f6f2",
        },
      ],
    }),
    [dashboardStats],
  );

  const facilityTypeChartData = useMemo(
    () => ({
      labels: (dashboardStats?.facility_types ?? []).map((type) => type.type),
      datasets: [
        {
          label: "Facility Count",
          data: (dashboardStats?.facility_types ?? []).map(
            (type) => type.count,
          ),
          backgroundColor: CHART_PALETTE,
          borderWidth: 2,
          borderColor: "#f7f6f2",
        },
      ],
    }),
    [dashboardStats],
  );

  const ageGroupChartData = useMemo(
    () => ({
      labels: demographics?.age_distribution
        ? Object.keys(demographics.age_distribution)
        : [],
      datasets: [
        {
          label: "Age Groups",
          data: demographics?.age_distribution
            ? Object.values(demographics.age_distribution)
            : [],
          backgroundColor: "#34383f",
          borderWidth: 0,
        },
      ],
    }),
    [demographics],
  );

  const monthlyTrendData = useMemo(
    () => ({
      labels: (demographics?.monthly_trend ?? []).map((item) => item.month),
      datasets: [
        {
          label: "New Registrations",
          data: (demographics?.monthly_trend ?? []).map((item) => item.count),
          borderColor: "#2c7350",
          backgroundColor: "rgba(44, 115, 80, 0.12)",
          tension: 0.3,
          fill: true,
        },
      ],
    }),
    [demographics],
  );

  const infectionTypeChartData = useMemo(
    () => ({
      labels: Object.keys(infectionTypeCount),
      datasets: [
        {
          label: "Infections",
          data: Object.values(infectionTypeCount),
          backgroundColor: CHART_PALETTE,
          borderWidth: 2,
          borderColor: "#f7f6f2",
        },
      ],
    }),
    [infectionTypeCount],
  );

  const vaccineTypeChartData = useMemo(
    () => ({
      labels: Object.keys(vaccineTypeCount),
      datasets: [
        {
          label: "Vaccinations",
          data: Object.values(vaccineTypeCount),
          backgroundColor: "#2c7350",
          borderWidth: 0,
        },
      ],
    }),
    [vaccineTypeCount],
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
          role="status"
          aria-label="Loading dashboard"
        ></div>
      </div>
    );
  }

  if (
    error ||
    !dashboardStats ||
    !demographics ||
    !facilityAnalytics ||
    !healthStats
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded border border-stamp-red/30 bg-stamp-red/5 px-6 py-4 text-stamp-red-ink">
          {error || "Failed to load dashboard"}
        </div>
      </div>
    );
  }

  // Thresholds for when a tag is earned rather than decorative (direction
  // contract: color is earned, never a rainbow rotation). A 50% vaccination
  // rate is this dashboard's own bar for "on track" vs. "needs attention" -
  // a judgment call documented here, not a clinical standard.
  const vaccinationOnTrack = Number(vaccinationRate) >= 50;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      {/* Staff by role - real employee_roles counts, standing in for the
          concept mock's "on duty" roster (no shift/attendance data exists
          in this API to back a real named on-duty list). */}
      <div className="mb-3 font-mono text-[11px] tracking-[0.14em] text-ink-soft">
        STAFF BY ROLE
      </div>
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {dashboardStats.employee_roles.map((r) => {
          const meta = roleMeta(r.role);
          return (
            <div
              key={r.role}
              className="badge-card flex items-center gap-2.5 px-3 py-2.5"
            >
              <span className="badge-tag" style={{ background: meta.color }}>
                {meta.abbr}
              </span>
              <div>
                <div className="text-sm font-bold tabular-nums text-ink">
                  {r.count}
                </div>
                <div className="text-[10px] capitalize text-ink-soft">
                  {r.role}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System counts ledger line */}
      <div className="mb-8 flex flex-wrap items-stretch border-y-[1.5px] border-ink">
        <Metric
          value={dashboardStats.overview.total_persons.toLocaleString()}
          label="PATIENTS"
        />
        <Metric
          value={dashboardStats.overview.total_employees.toLocaleString()}
          label="STAFF"
        />
        <Metric
          value={dashboardStats.overview.total_facilities.toString()}
          label="FACILITIES"
        />
        <Metric value={`${vaccinationRate}%`} label="VACCINATED" />
        <Metric
          value={atCapacityCount}
          label="AT CAPACITY"
          urgent={atCapacityCount > 0}
        />
      </div>

      {/* Top facilities + citizenship split */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <FormPanel title="Top Facilities by Capacity">
          <div className="-m-5 overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b-[1.5px] border-ink text-left text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-soft">
                  <th className="px-5 pb-2.5 pt-0">Facility</th>
                  <th className="px-5 pb-2.5 pt-0">Type</th>
                  <th className="px-5 pb-2.5 pt-0">Capacity</th>
                  <th className="px-5 pb-2.5 pt-0">Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {topFacilities.map((facility, index) => {
                  const full = facility.occupancy_rate >= 100;
                  const tone = full
                    ? "text-stamp-red-ink"
                    : facility.occupancy_rate >= 80
                    ? "text-pending-amber-ink"
                    : "text-verified-green-ink";
                  return (
                    <tr
                      key={index}
                      className="border-b border-paper-line last:border-b-0"
                    >
                      <td className="px-5 py-3 text-sm font-bold text-ink">
                        {facility.name}
                        <span className="mt-0.5 block font-mono text-[10px] font-normal text-ink-soft">
                          {facility.city}, {facility.province}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-ink-soft">
                        {facility.type}
                      </td>
                      <td className="px-5 py-3 font-mono text-sm tabular-nums text-ink">
                        {facility.capacity.toLocaleString()} beds
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-sm font-bold tabular-nums ${tone}`}
                          >
                            {facility.occupancy_rate.toFixed(0)}%
                          </span>
                          {full && (
                            <span
                              className="badge-tag"
                              style={{ background: "var(--color-stamp-red)" }}
                            >
                              FULL
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FormPanel>

        <FormPanel title="Citizenship">
          <table className="w-full">
            <tbody>
              {citizenshipRows.map((row) => (
                <tr
                  key={row.citizenship}
                  className="border-b border-paper-line last:border-b-0"
                >
                  <td className="py-2.5 text-sm font-medium text-ink">
                    {row.citizenship}
                  </td>
                  <td className="py-2.5 text-right font-mono text-sm tabular-nums text-ink-soft">
                    {row.pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormPanel>
      </div>

      {/* Health monitoring ledger */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormPanel title="Health Monitoring">
          <CensusRow
            label="Total Infections"
            value={totalInfections.toLocaleString()}
            note={
              recentInfections > 0
                ? undefined
                : "none recorded in the last 30 days"
            }
            tag={
              recentInfections > 0
                ? { label: "ACTIVE", color: "var(--color-stamp-red)" }
                : undefined
            }
          />
          <CensusRow
            label="Total Vaccinations"
            value={totalVaccinations.toLocaleString()}
            note={`${uniqueVaccinatedPeople} people vaccinated`}
            tag={{ label: "VERIFIED", color: "var(--color-verified-green)" }}
          />
          <CensusRow
            label="Vaccination Rate"
            value={`${vaccinationRate}%`}
            note="of total population"
            tag={
              vaccinationOnTrack
                ? { label: "ON TRACK", color: "var(--color-verified-green)" }
                : {
                    label: "NEEDS OUTREACH",
                    color: "var(--color-pending-amber)",
                  }
            }
          />
          <CensusRow
            label="Active Schedules"
            value={activeSchedules.toString()}
            note={
              activeSchedules === 0
                ? "no shifts logged in the current calendar week"
                : "shifts this week"
            }
          />
        </FormPanel>

        <FormPanel title="Facilities by Type">
          <div className="h-64">
            <Pie
              data={facilityTypeChartData}
              options={{ ...chartOptions, scales: undefined }}
            />
          </div>
        </FormPanel>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormPanel title="Employee Distribution by Role">
          <div className="h-64">
            <Pie
              data={employeeRoleChartData}
              options={{ ...chartOptions, scales: undefined }}
            />
          </div>
        </FormPanel>

        <FormPanel title="Age Distribution">
          <div className="h-64">
            <Bar
              data={ageGroupChartData}
              options={{ ...chartOptions, scales: barLineScales }}
            />
          </div>
        </FormPanel>

        <FormPanel title="Registration Trend">
          <div className="h-64">
            <Line
              data={monthlyTrendData}
              options={{ ...chartOptions, scales: barLineScales }}
            />
          </div>
        </FormPanel>

        <FormPanel title="Infection Types Distribution">
          <div className="h-64">
            <Pie
              data={infectionTypeChartData}
              options={{ ...chartOptions, scales: undefined }}
            />
          </div>
        </FormPanel>

        <FormPanel title="Vaccine Types Distribution" className="lg:col-span-2">
          <div className="h-64">
            <Bar
              data={vaccineTypeChartData}
              options={{ ...chartOptions, scales: barLineScales }}
            />
          </div>
        </FormPanel>
      </div>
    </div>
  );
};

export default Dashboard;
