import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

interface Facility {
  fid: number;
  name: string;
  type: string;
  city: string;
}

interface ScheduleFormData {
  essn: number;
  fid: number;
  date: string;
  start_time: string;
  end_time: string | null;
  employee_name?: string;
  facility_name?: string;
  employee_role?: string;
}

const EditSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [formData, setFormData] = useState<ScheduleFormData>({
    essn: 0,
    fid: 0,
    date: "",
    start_time: "",
    end_time: null,
  });
  const [employeeName, setEmployeeName] = useState<string>("");
  const [employeeRole, setEmployeeRole] = useState<string>("");

  // Load schedule data and facilities when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        navigate("/schedules");
        return;
      }

      try {
        const [scheduleResponse, facilitiesResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.schedules}${id}/`),
          axios.get(API_ENDPOINTS.facilities),
        ]);
        setFormData(scheduleResponse.data);
        setEmployeeName(scheduleResponse.data.employee_name || "");
        setEmployeeRole(scheduleResponse.data.employee_role || "");
        setFacilities(facilitiesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ general: "Failed to load schedule data." });
      } finally {
        setInitialLoading(false);
        setFacilitiesLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "fid" ? parseInt(value) : value || null,
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
      await axios.put(`${API_ENDPOINTS.schedules}${id}/`, {
        essn: formData.essn,
        fid: formData.fid,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
      });
      navigate("/schedules", {
        state: { message: "Schedule updated successfully!" },
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
      if (axios.isAxiosError(error) && error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: "Failed to update schedule. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/schedules");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <PencilSquareIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Work Schedule
            </h1>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Schedule Information
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Employee:</strong> {employeeName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Role:</strong> {employeeRole}
              </p>
              <p className="text-sm text-gray-600">
                <strong>SSN:</strong> {formData.essn}
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
                  value={formData.end_time || ""}
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
                disabled={loading || facilitiesLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Schedule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSchedule;
