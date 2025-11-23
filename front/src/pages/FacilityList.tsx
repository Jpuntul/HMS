import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  UserIcon,
  UserGroupIcon,
  PhoneIcon,
  MapPinIcon,
  UserCircleIcon,
  EyeIcon,
  GlobeAltIcon,
  HomeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";
import SearchResultsHeader from "../components/SearchResultsHeader";
import Pagination from "../components/Pagination";
import { useAuth } from "../contexts/AuthContext";

interface Facility {
  fid: number;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone_number: string;
  web_address: string;
  type: string;
  capacity: number;
  gmssn: number;
  general_manager_name: string;
}

const FacilityList: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
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
    fetchFacilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, typeFilter, currentPage]);

  // Reset to page 1 when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, typeFilter]);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:8000/api/facilities/";
      const params = new URLSearchParams();

      params.append("page", currentPage.toString());

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }
      if (typeFilter) {
        params.append("type", typeFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      // Handle paginated response
      const data = response.data.results || response.data;
      setFacilities(Array.isArray(data) ? data : []);
      setTotalCount(response.data.count || data.length);
      setTotalPages(Math.ceil((response.data.count || data.length) / 20));
      setLoading(false);
    } catch {
      setError("Failed to fetch facilities");
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const iconProps = "h-6 w-6";
    switch (type) {
      case "Hospital":
        return <BuildingOffice2Icon className={`${iconProps} text-red-600`} />;
      case "CLSC":
        return <BuildingOfficeIcon className={`${iconProps} text-blue-600`} />;
      case "Clinic":
        return <HomeIcon className={`${iconProps} text-green-600`} />;
      case "Pharmacy":
        return (
          <BuildingOfficeIcon className={`${iconProps} text-purple-600`} />
        );
      case "Special installment":
        return (
          <BuildingOffice2Icon className={`${iconProps} text-yellow-600`} />
        );
      default:
        return <BuildingOfficeIcon className={`${iconProps} text-gray-600`} />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Hospital: "bg-red-100 text-red-800",
      CLSC: "bg-blue-100 text-blue-800",
      Clinic: "bg-green-100 text-green-800",
      Pharmacy: "bg-purple-100 text-purple-800",
      "Special installment": "bg-yellow-100 text-yellow-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const totalCapacity = facilities.reduce(
    (sum, facility) => sum + (facility.capacity || 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading facilities...</div>
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
                <BuildingOffice2Icon className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Facility Management
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Healthcare facilities across the network
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {user ? (
                  <Link
                    to="/add-facility"
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Facility</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Login to Add Facility</span>
                  </Link>
                )}
                <Link
                  to="/persons"
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>View Persons</span>
                </Link>
                <Link
                  to="/employees"
                  className="flex items-center space-x-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <UserGroupIcon className="h-4 w-4" />
                  <span>View Employees</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search facilities by name, address, or city..."
                  label="Search"
                />
              </div>
              <div className="w-full sm:w-64">
                <FilterDropdown
                  label="Type"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    {
                      value: "Hospital",
                      label: "Hospital",
                      count: facilities.filter((f) => f.type === "Hospital")
                        .length,
                    },
                    {
                      value: "CLSC",
                      label: "CLSC",
                      count: facilities.filter((f) => f.type === "CLSC").length,
                    },
                    {
                      value: "Clinic",
                      label: "Clinic",
                      count: facilities.filter((f) => f.type === "Clinic")
                        .length,
                    },
                    {
                      value: "Pharmacy",
                      label: "Pharmacy",
                      count: facilities.filter((f) => f.type === "Pharmacy")
                        .length,
                    },
                    {
                      value: "Special installment",
                      label: "Special installment",
                      count: facilities.filter(
                        (f) => f.type === "Special installment",
                      ).length,
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Search Results Header */}
          {(searchTerm || typeFilter) && (
            <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
              <SearchResultsHeader
                totalResults={facilities.length}
                searchTerm={searchTerm}
                filterCount={typeFilter ? 1 : 0}
                onClearFilters={() => {
                  setSearchTerm("");
                  setTypeFilter("");
                }}
              />
            </div>
          )}

          {/* Stats */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {facilities.length}
                </div>
                <div className="text-blue-800 font-medium">
                  Total Facilities
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {facilities.filter((f) => f.type === "Hospital").length}
                </div>
                <div className="text-red-800 font-medium">Hospitals</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {
                    facilities.filter(
                      (f) => f.type === "Clinic" || f.type === "CLSC",
                    ).length
                  }
                </div>
                <div className="text-green-800 font-medium">
                  Clinics & CLSCs
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {totalCapacity.toLocaleString()}
                </div>
                <div className="text-purple-800 font-medium">
                  Total Capacity
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Facility Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <div
              key={facility.fid}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getTypeIcon(facility.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {facility.name}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTypeBadgeColor(
                          facility.type,
                        )}`}
                      >
                        {facility.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Address:</span>
                      <span className="ml-1 line-clamp-2">
                        {facility.address}, {facility.city}, {facility.province}{" "}
                        {facility.postal_code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Phone:</span>
                    <span>{facility.phone_number}</span>
                  </div>

                  {facility.capacity && (
                    <div className="flex items-center space-x-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Capacity:</span>
                      <span className="font-semibold text-blue-600">
                        {facility.capacity} beds
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <UserCircleIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Manager:</span>
                    <span>{facility.general_manager_name}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                      <EyeIcon className="h-3 w-3" />
                      <span>Details</span>
                    </button>
                    {user ? (
                      <>
                        <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors">
                          <PencilIcon className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                          <TrashIcon className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                      >
                        <GlobeAltIcon className="h-3 w-3" />
                        <span>Login to Edit</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {facilities.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BuildingOffice2Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <div className="text-xl font-medium text-gray-900 mb-2">
              No facilities found
            </div>
            <div className="text-gray-600">
              There are no facilities in the system.
            </div>
          </div>
        )}

        {/* Pagination */}
        {facilities.length > 0 && (
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

export default FacilityList;
