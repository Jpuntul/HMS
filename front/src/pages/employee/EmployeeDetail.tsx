import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import {
  UserGroupIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface EmployeeData {
  ssn: number;
  role: string;
  person_name: string;
  person_email: string;
  person_phone: string;
}

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) {
        navigate("/employees");
        return;
      }

      try {
        const response = await axios.get(`${API_ENDPOINTS.employees}${id}/`);
        setEmployee(response.data);
      } catch (error) {
        console.error("Error fetching employee:", error);
        setError("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Employee not found"}</p>
          <Link to="/employees" className="text-green-600 hover:text-green-700">
            Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/employees"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Employees
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserGroupIcon className="h-10 w-10 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Employee Details
                </h1>
                <p className="text-gray-500">SSN: {employee.ssn}</p>
              </div>
            </div>
            <Link
              to={`/employees/${id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PencilSquareIcon className="h-5 w-5 mr-2" />
              Edit
            </Link>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Full Name
              </h3>
              <p className="text-lg text-gray-900">{employee.person_name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Role
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {employee.role}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Email
              </h3>
              <p className="text-lg text-gray-900">
                {employee.person_email || "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Phone
              </h3>
              <p className="text-lg text-gray-900">
                {employee.person_phone || "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                SSN
              </h3>
              <p className="text-lg text-gray-900">{employee.ssn}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
