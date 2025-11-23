import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import Pagination from "../components/Pagination";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  // Custom hook for debouncing search term
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchVaccinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:8000/api/vaccinations/";
      const params = new URLSearchParams();

      params.append("page", currentPage.toString());

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      // Handle paginated response
      const data = response.data.results || response.data;
      setVaccinations(Array.isArray(data) ? data : []);
      setTotalCount(response.data.count || data.length);
      setTotalPages(Math.ceil((response.data.count || data.length) / 20));
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Vaccination Records
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Track and manage vaccination history
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {user ? (
                  <Link
                    to="/vaccinations/add"
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Vaccination Record</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Login to Add Records</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search by person name, vaccine type, or facility..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Stats */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {totalCount}
                </div>
                <div className="text-green-800 font-medium">
                  Total Vaccinations
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(vaccinations.map((v) => v.ssn)).size}
                </div>
                <div className="text-blue-800 font-medium">
                  Vaccinated People
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(vaccinations.map((v) => v.vaccine_type_name)).size}
                </div>
                <div className="text-purple-800 font-medium">Vaccine Types</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {vaccinations.length > 0
                    ? (
                        vaccinations.reduce((acc, v) => acc + v.no_of_dose, 0) /
                        vaccinations.length
                      ).toFixed(1)
                    : 0}
                </div>
                <div className="text-yellow-800 font-medium">Average Dose</div>
              </div>
            </div>
          </div>
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

        {/* Pagination */}
        {vaccinations.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            itemsPerPage={20}
          />
        )}
      </div>
    </div>
  );
};

export default VaccinationList;
