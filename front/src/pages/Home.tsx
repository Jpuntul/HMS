import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  BuildingOffice2Icon,
  ChartBarIcon,
  UserIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  overview: {
    total_persons: number;
    total_employees: number;
    total_facilities: number;
    total_capacity: number;
  };
}

const Home: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/analytics/dashboard/",
      );
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <BuildingOffice2Icon className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Healthcare Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive healthcare management with real patient data, employee
            records, and facility information.
          </p>
        </div>

        {/* Quick Stats */}
        {!loading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.overview.total_persons.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">Patients</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.overview.total_employees.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">Staff</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.overview.total_facilities}
              </div>
              <div className="text-gray-600 font-medium">Facilities</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="text-3xl font-bold text-orange-600">
                {stats.overview.total_capacity.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">Bed Capacity</div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/dashboard"
            className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow group"
          >
            <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
              <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analytics Dashboard
            </h3>
            <p className="text-gray-600 mb-4">
              View comprehensive system analytics and insights
            </p>
            <div className="flex items-center text-indigo-600 font-medium">
              View Dashboard{" "}
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/persons"
            className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow group"
          >
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Patient Records
            </h3>
            <p className="text-gray-600 mb-4">
              Manage patient records and personal information
            </p>
            <div className="flex items-center text-blue-600 font-medium">
              Manage Patients{" "}
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/employees"
            className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow group"
          >
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
              <UserGroupIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Staff Management
            </h3>
            <p className="text-gray-600 mb-4">
              Track healthcare staff and their roles
            </p>
            <div className="flex items-center text-green-600 font-medium">
              View Staff{" "}
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/facilities"
            className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow group"
          >
            <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
              <BuildingOffice2Icon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Facility Network
            </h3>
            <p className="text-gray-600 mb-4">
              Oversee hospitals, clinics, and healthcare centers
            </p>
            <div className="flex items-center text-purple-600 font-medium">
              View Facilities{" "}
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              View Analytics
            </Link>
            <Link
              to="/persons/add"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <UserIcon className="h-5 w-5 mr-2" />
              Add New Patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
