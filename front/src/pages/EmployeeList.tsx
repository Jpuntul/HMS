import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";
import { useAuth } from "../contexts/AuthContext";
import {
  UserGroupIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface Employee {
  ssn: number;
  role: string;
  person_name: string;
  person_email: string;
  person_phone: string;
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { user } = useAuth();

  const fetchEmployees = async () => {
    try {
      let url = "http://localhost:8000/api/employees/";
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (roleFilter) {
        params.append("role", roleFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setEmployees(response.data);
      setLoading(false);
    } catch {
      setError("Failed to fetch employees");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter]);

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      doctor: "bg-blue-100 text-blue-800",
      nurse: "bg-green-100 text-green-800",
      pharmacist: "bg-purple-100 text-purple-800",
      cashier: "bg-yellow-100 text-yellow-800",
      receptionist: "bg-pink-100 text-pink-800",
      "administrative personnel": "bg-gray-100 text-gray-800",
      "security personnel": "bg-red-100 text-red-800",
      "regular employee": "bg-indigo-100 text-indigo-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading employees...</div>
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
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Employee Management
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Manage healthcare facility staff members
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {user ? (
                  <Link
                    to="/add-employee"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Employee</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Login to Add Employee</span>
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
                  to="/facilities"
                  className="flex items-center space-x-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>View Facilities</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {employees.length}
                </div>
                <div className="text-blue-800 font-medium">Total Employees</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {
                    employees.filter(
                      (emp) => emp.role === "doctor" || emp.role === "nurse",
                    ).length
                  }
                </div>
                <div className="text-green-800 font-medium">Medical Staff</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(employees.map((emp) => emp.role)).size}
                </div>
                <div className="text-purple-800 font-medium">
                  Different Roles
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white shadow-sm rounded-lg mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name, SSN, role..."
                label="Search"
                className="w-full"
              />
            </div>
            <FilterDropdown
              label="Role"
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: "doctor", label: "Doctor" },
                { value: "nurse", label: "Nurse" },
                { value: "pharmacist", label: "Pharmacist" },
                { value: "cashier", label: "Cashier" },
                { value: "receptionist", label: "Receptionist" },
                {
                  value: "administrative personnel",
                  label: "Administrative Personnel",
                },
                { value: "security personnel", label: "Security Personnel" },
                { value: "regular employee", label: "Regular Employee" },
              ]}
            />
          </div>

          {(searchTerm || roleFilter) && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {employees.length} employee{employees.length !== 1 ? "s" : ""}{" "}
                found
                {searchTerm && ` for "${searchTerm}"`}
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {employees.map((employee) => (
            <div
              key={employee.ssn}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-gray-900">
                    {employee.person_name}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      employee.role,
                    )}`}
                  >
                    {employee.role}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <IdentificationIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">SSN:</span>
                    <span>{employee.ssn}</span>
                  </div>

                  {employee.person_email && (
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Email:</span>
                      <span className="truncate">{employee.person_email}</span>
                    </div>
                  )}

                  {employee.person_phone && (
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Phone:</span>
                      <span>{employee.person_phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
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
                        <ClockIcon className="h-3 w-3" />
                        <span>Login to Edit</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {employees.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <div className="text-xl font-medium text-gray-900 mb-2">
              No employees found
            </div>
            <div className="text-gray-600">
              There are no employees in the system.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
