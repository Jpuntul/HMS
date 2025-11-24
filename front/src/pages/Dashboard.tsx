import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
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
import {
  ChartBarIcon,
  UsersIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  TruckIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">
          {error || "Failed to load dashboard"}
        </div>
      </div>
    );
  }

  // Calculate health metrics
  const totalInfections = healthStats.infections.length;
  const totalVaccinations = healthStats.vaccinations.length;
  const uniqueVaccinatedPeople = new Set(
    healthStats.vaccinations.map((v) => v.ssn),
  ).size;
  const vaccinationRate =
    dashboardStats.overview.total_persons > 0
      ? (
          (uniqueVaccinatedPeople / dashboardStats.overview.total_persons) *
          100
        ).toFixed(1)
      : 0;

  // Get recent infections (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentInfections = healthStats.infections.filter(
    (inf) => new Date(inf.date) > thirtyDaysAgo,
  ).length;

  // Infection type distribution
  const infectionTypeCount = healthStats.infections.reduce(
    (acc, inf) => {
      acc[inf.infection_type_name] = (acc[inf.infection_type_name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Vaccine type distribution
  const vaccineTypeCount = healthStats.vaccinations.reduce(
    (acc, vac) => {
      acc[vac.vaccine_type_name] = (acc[vac.vaccine_type_name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Active schedules (this week)
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const activeSchedules = healthStats.schedules.filter((sch) => {
    const schDate = new Date(sch.date);
    return schDate >= weekStart && schDate <= weekEnd;
  }).length;

  // Chart configurations
  const employeeRoleChartData = {
    labels: dashboardStats.employee_roles.map(
      (role) => role.role.charAt(0).toUpperCase() + role.role.slice(1),
    ),
    datasets: [
      {
        label: "Employee Count",
        data: dashboardStats.employee_roles.map((role) => role.count),
        backgroundColor: [
          "#3B82F6",
          "#EF4444",
          "#10B981",
          "#F59E0B",
          "#8B5CF6",
          "#06B6D4",
          "#84CC16",
          "#F97316",
          "#EC4899",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const facilityTypeChartData = {
    labels: dashboardStats.facility_types.map((type) => type.type),
    datasets: [
      {
        label: "Facility Count",
        data: dashboardStats.facility_types.map((type) => type.count),
        backgroundColor: [
          "#10B981",
          "#3B82F6",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const ageGroupChartData = {
    labels: demographics.age_distribution
      ? Object.keys(demographics.age_distribution)
      : [],
    datasets: [
      {
        label: "Age Groups",
        data: demographics.age_distribution
          ? Object.values(demographics.age_distribution)
          : [],
        backgroundColor: "#3B82F6",
        borderColor: "#1D4ED8",
        borderWidth: 1,
      },
    ],
  };

  const monthlyTrendData = {
    labels: demographics.monthly_trend.map((item) => item.month),
    datasets: [
      {
        label: "New Registrations",
        data: demographics.monthly_trend.map((item) => item.count),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                HMS Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Healthcare Management System Analytics
              </p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardStats.overview.total_persons.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Persons</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardStats.overview.total_employees.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Employees</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOffice2Icon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardStats.overview.total_facilities}
                </div>
                <div className="text-sm text-gray-600">
                  Healthcare Facilities
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TruckIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardStats.overview.total_capacity.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Capacity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-red-600 mb-1">
                  Total Infections
                </div>
                <div className="text-3xl font-bold text-red-900">
                  {totalInfections.toLocaleString()}
                </div>
                <div className="text-xs text-red-600 mt-2">
                  {recentInfections} in last 30 days
                </div>
              </div>
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-green-600 mb-1">
                  Total Vaccinations
                </div>
                <div className="text-3xl font-bold text-green-900">
                  {totalVaccinations.toLocaleString()}
                </div>
                <div className="text-xs text-green-600 mt-2">
                  {uniqueVaccinatedPeople} people vaccinated
                </div>
              </div>
              <ShieldCheckIcon className="h-12 w-12 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-600 mb-1">
                  Vaccination Rate
                </div>
                <div className="text-3xl font-bold text-blue-900">
                  {vaccinationRate}%
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  of total population
                </div>
              </div>
              <ChartBarIcon className="h-12 w-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-purple-600 mb-1">
                  Active Schedules
                </div>
                <div className="text-3xl font-bold text-purple-900">
                  {activeSchedules}
                </div>
                <div className="text-xs text-purple-600 mt-2">
                  shifts this week
                </div>
              </div>
              <UserGroupIcon className="h-12 w-12 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Employee Roles Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Employee Distribution by Role
            </h3>
            <div className="h-64">
              <Pie data={employeeRoleChartData} options={chartOptions} />
            </div>
          </div>

          {/* Facility Types Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Facilities by Type
            </h3>
            <div className="h-64">
              <Pie data={facilityTypeChartData} options={chartOptions} />
            </div>
          </div>

          {/* Age Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Age Distribution
            </h3>
            <div className="h-64">
              <Bar data={ageGroupChartData} options={chartOptions} />
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Registration Trend
            </h3>
            <div className="h-64">
              <Line data={monthlyTrendData} options={chartOptions} />
            </div>
          </div>

          {/* Infection Types Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Infection Types Distribution
            </h3>
            <div className="h-64">
              <Pie
                data={{
                  labels: Object.keys(infectionTypeCount),
                  datasets: [
                    {
                      label: "Infections",
                      data: Object.values(infectionTypeCount),
                      backgroundColor: [
                        "#EF4444",
                        "#F97316",
                        "#F59E0B",
                        "#EAB308",
                        "#84CC16",
                        "#22C55E",
                        "#10B981",
                        "#14B8A6",
                      ],
                      borderWidth: 2,
                      borderColor: "#fff",
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Vaccine Types Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vaccine Types Distribution
            </h3>
            <div className="h-64">
              <Bar
                data={{
                  labels: Object.keys(vaccineTypeCount),
                  datasets: [
                    {
                      label: "Vaccinations",
                      data: Object.values(vaccineTypeCount),
                      backgroundColor: "#10B981",
                      borderColor: "#059669",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Top Facilities Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Facilities by Capacity
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {facilityAnalytics.facilities
                  .slice(0, 10)
                  .map((facility, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {facility.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {facility.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {facility.capacity.toLocaleString()} beds
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.city}, {facility.province}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  facility.occupancy_rate,
                                  100,
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {facility.occupancy_rate.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
