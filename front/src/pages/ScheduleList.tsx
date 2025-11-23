import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  ClockIcon,
  PlusIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface Schedule {
  essn: number;
  fid: number;
  date: string;
  start_time: string;
  end_time: string;
  employee_name: string;
  facility_name: string;
  employee_role: string;
}

const ScheduleList: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useAuth();

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchSchedules = async () => {
    try {
      let url = "http://localhost:8000/api/schedules/";
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setSchedules(response.data);
      setLoading(false);
    } catch {
      setError("Failed to fetch schedules");
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      doctor: "bg-blue-100 text-blue-800",
      nurse: "bg-green-100 text-green-800",
      pharmacist: "bg-purple-100 text-purple-800",
      cashier: "bg-yellow-100 text-yellow-800",
      receptionist: "bg-pink-100 text-pink-800",
      "administrative personnel": "bg-gray-100 text-gray-800",
      "security personnel": "bg-red-100 text-red-800",
    };
    return colors[role.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  // Filter schedules based on search and filters
  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      !searchTerm ||
      schedule.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.facility_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.employee_role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      !selectedRole || schedule.employee_role === selectedRole;
    const matchesFacility =
      !selectedFacility || schedule.facility_name === selectedFacility;

    return matchesSearch && matchesRole && matchesFacility;
  });

  // Get unique roles and facilities for filters
  const uniqueRoles = [
    ...new Set(schedules.map((s) => s.employee_role)),
  ].sort();
  const uniqueFacilities = [
    ...new Set(schedules.map((s) => s.facility_name)),
  ].sort();

  // Group schedules by date for list view
  const groupedSchedules = filteredSchedules.reduce(
    (acc, schedule) => {
      const date = schedule.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(schedule);
      return acc;
    },
    {} as Record<string, Schedule[]>,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading schedules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ClockIcon className="h-8 w-8 mr-3 text-blue-600" />
                Employee Schedules
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage work schedules and shifts ({schedules.length} schedules)
              </p>
            </div>
            {user && (
              <Link
                to="/schedules/add"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Schedule
              </Link>
            )}
            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Login to Add Schedules
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by employee, facility, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Facilities</option>
              {uniqueFacilities.map((facility) => (
                <option key={facility} value={facility}>
                  {facility}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredSchedules.length} of {schedules.length} schedules
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                List by Date
              </button>
            </div>
          </div>
        </div>

        {/* Schedules Display */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((schedule, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <UserIcon className="h-6 w-6 text-blue-600 mr-2" />
                    <div className="text-lg font-semibold text-gray-900">
                      {schedule.employee_name}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                      schedule.employee_role,
                    )}`}
                  >
                    {schedule.employee_role}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {schedule.facility_name}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {new Date(schedule.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">
                      {schedule.start_time.slice(0, 5)}
                    </span>
                    <span className="mx-2">→</span>
                    <span className="font-medium text-gray-900">
                      {schedule.end_time
                        ? schedule.end_time.slice(0, 5)
                        : "Ongoing"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    SSN: {schedule.essn} • Facility ID: {schedule.fid}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedules)
              .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
              .map(([date, daySchedules]) => (
                <div key={date} className="bg-white rounded-lg shadow">
                  <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {daySchedules.length} shifts
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {daySchedules.map((schedule, idx) => (
                      <div
                        key={idx}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">
                                {schedule.start_time.slice(0, 5)} -{" "}
                                {schedule.end_time
                                  ? schedule.end_time.slice(0, 5)
                                  : "Ongoing"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-900">
                                {schedule.employee_name}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                                schedule.employee_role,
                              )}`}
                            >
                              {schedule.employee_role}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            {schedule.facility_name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {filteredSchedules.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No schedules found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedRole || selectedFacility
                ? "Try adjusting your filters"
                : "Get started by adding a new schedule"}
            </p>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Total Schedules
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {schedules.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Scheduled Employees
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {new Set(schedules.map((s) => s.essn)).size}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Active Facilities
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {new Set(schedules.map((s) => s.fid)).size}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleList;
