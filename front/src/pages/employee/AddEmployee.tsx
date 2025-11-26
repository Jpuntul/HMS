import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { UserPlusIcon } from "@heroicons/react/24/outline";

interface Person {
  ssn: number;
  first_name: string;
  last_name: string;
  medicare: string;
}

interface EmployeeFormData {
  ssn: string;
  role: string;
}

const ROLE_CHOICES = [
  { value: "nurse", label: "Nurse" },
  { value: "doctor", label: "Doctor" },
  { value: "cashier", label: "Cashier" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "receptionist", label: "Receptionist" },
  { value: "administrative personnel", label: "Administrative Personnel" },
  { value: "security personnel", label: "Security Personnel" },
  { value: "regular employee", label: "Regular Employee" },
];

const AddEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [personsLoading, setPersonsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [persons, setPersons] = useState<Person[]>([]);
  const [formData, setFormData] = useState<EmployeeFormData>({
    ssn: "",
    role: "",
  });

  // Load available persons
  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.persons);
        setPersons(response.data.results || response.data);
      } catch (error) {
        console.error("Error fetching persons:", error);
        setErrors({ general: "Failed to load persons list." });
      } finally {
        setPersonsLoading(false);
      }
    };

    fetchPersons();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ssn) newErrors.ssn = "Please select a person";
    if (!formData.role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.post(API_ENDPOINTS.employees, formData);
      navigate("/employees", {
        state: { message: "Employee added successfully!" },
      });
    } catch (error) {
      console.error("Error adding employee:", error);
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        // Handle different error formats from backend
        if (errorData.detail) {
          setErrors({ general: errorData.detail });
        } else if (errorData.non_field_errors) {
          setErrors({ general: errorData.non_field_errors[0] });
        } else {
          setErrors(errorData);
        }
      } else {
        setErrors({ general: "Failed to add employee. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/employees");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <UserPlusIcon className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Employee
            </h1>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="ssn"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Person *
              </label>
              {personsLoading ? (
                <div className="text-gray-500">Loading persons...</div>
              ) : (
                <select
                  id="ssn"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.ssn ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select a person --</option>
                  {persons.map((person) => (
                    <option key={person.ssn} value={person.ssn}>
                      {person.first_name} {person.last_name} (SSN: {person.ssn})
                    </option>
                  ))}
                </select>
              )}
              {errors.ssn && (
                <p className="mt-1 text-sm text-red-600">{errors.ssn}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Select the person who will become an employee
              </p>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Employee Role *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.role ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">-- Select a role --</option>
                {ROLE_CHOICES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || personsLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
