import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  ShieldCheckIcon,
  PlusIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

interface Vaccination {
  ssn: number;
  type_id: number;
  date: string;
  no_of_dose: number;
  fid: number;
  person_name: string;
  vaccine_type_name: string;
  facility_name: string;
}

const VaccinationList: React.FC = () => {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchVaccinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchVaccinations = async () => {
    try {
      let url = "http://localhost:8000/api/vaccinations/";
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setVaccinations(response.data);
      setLoading(false);
    } catch {
      setError("Failed to fetch vaccinations");
      setLoading(false);
    }
  };

  const getDoseBadgeColor = (dose: number) => {
    if (dose === 1) return "bg-blue-100 text-blue-800";
    if (dose === 2) return "bg-green-100 text-green-800";
    return "bg-purple-100 text-purple-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading vaccinations...</div>
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
                <ShieldCheckIcon className="h-8 w-8 mr-3 text-green-600" />
                Vaccination Records
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Track and manage vaccination history ({vaccinations.length}{" "}
                records)
              </p>
            </div>
            {user && (
              <Link
                to="/vaccinations/add"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Vaccination Record
              </Link>
            )}
            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Login to Add Records
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by person name, vaccine type, or facility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Vaccinations Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vaccine Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facility
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vaccinations.map((vaccination, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {vaccination.person_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {vaccination.vaccine_type_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDoseBadgeColor(
                        vaccination.no_of_dose,
                      )}`}
                    >
                      Dose {vaccination.no_of_dose}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {new Date(vaccination.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {vaccination.facility_name}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {vaccinations.length === 0 && (
            <div className="text-center py-12">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No vaccination records found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by adding a new vaccination record"}
              </p>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Total Vaccinations
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {vaccinations.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Vaccinated People
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {new Set(vaccinations.map((v) => v.ssn)).size}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Vaccine Types
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {new Set(vaccinations.map((v) => v.vaccine_type_name)).size}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Average Dose
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {vaccinations.length > 0
                ? (
                    vaccinations.reduce((acc, v) => acc + v.no_of_dose, 0) /
                    vaccinations.length
                  ).toFixed(1)
                : 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationList;
