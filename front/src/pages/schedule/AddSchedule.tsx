import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface Employee {
  ssn: number;
  role: string;
  person_name: string;
}

interface Facility {
  fid: number;
  name: string;
  type: string;
  city: string;
}

interface ScheduleFormData {
  essn: string;
  fid: string;
  date: string;
  start_time: string;
  end_time: string;
}

const AddSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [formData, setFormData] = useState<ScheduleFormData>({
    essn: "",
    fid: "",
    date: "",
    start_time: "",
    end_time: "",
  });

  // Load available employees and facilities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesResponse, facilitiesResponse] = await Promise.all([
          axios.get(API_ENDPOINTS.employees),
          axios.get(API_ENDPOINTS.facilities),
        ]);
        setEmployees(employeesResponse.data.results || employeesResponse.data);
        setFacilities(
          facilitiesResponse.data.results || facilitiesResponse.data,
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ general: "Failed to load required data." });
      } finally {
        setEmployeesLoading(false);
        setFacilitiesLoading(false);
      }
    };

    fetchData();
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

    if (!formData.essn) newErrors.essn = "Please select an employee";
    if (!formData.fid) newErrors.fid = "Please select a facility";
    if (!formData.date) newErrors.date = "Schedule date is required";
    if (!formData.start_time) newErrors.start_time = "Start time is required";

    // Validate time if both start and end times are provided
    if (formData.start_time && formData.end_time) {
      if (formData.end_time <= formData.start_time) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        essn: formData.essn,
        fid: formData.fid,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
      };
      await axios.post(API_ENDPOINTS.schedules, submitData);
      navigate("/schedules", {
        state: { message: "Schedule added successfully!" },
      });
    } catch (error) {
      console.error("Error adding schedule:", error);
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
        setErrors({ general: "Failed to add schedule. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/schedules");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Add Work Schedule
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
                htmlFor="essn"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Employee *
              </label>
              {employeesLoading ? (
                <div className="text-gray-500">Loading employees...</div>
              ) : (
                <select
                  id="essn"
                  name="essn"
                  value={formData.essn}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.essn ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select an employee --</option>
                  {employees.map((employee) => (
                    <option key={employee.ssn} value={employee.ssn}>
                      {employee.person_name} - {employee.role} (SSN:{" "}
                      {employee.ssn})
                    </option>
                  ))}
                </select>
              )}
              {errors.essn && (
                <p className="mt-1 text-sm text-red-600">{errors.essn}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Select the employee to schedule
              </p>
            </div>

            <div>
              <label
                htmlFor="fid"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Facility *
              </label>
              {facilitiesLoading ? (
                <div className="text-gray-500">Loading facilities...</div>
              ) : (
                <select
                  id="fid"
                  name="fid"
                  value={formData.fid}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fid ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select a facility --</option>
                  {facilities.map((facility) => (
                    <option key={facility.fid} value={facility.fid}>
                      {facility.name} - {facility.type} ({facility.city})
                    </option>
                  ))}
                </select>
              )}
              {errors.fid && (
                <p className="mt-1 text-sm text-red-600">{errors.fid}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Select the facility where the employee will work
              </p>
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Work Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Date of the scheduled shift
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="start_time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Start Time *
                </label>
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.start_time ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.start_time && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.start_time}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="end_time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  End Time
                </label>
                <input
                  type="time"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.end_time ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.end_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty for open-ended shift
                </p>
              </div>
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
                disabled={loading || employeesLoading || facilitiesLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : "Add Schedule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSchedule;
