import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { CalendarIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/Dropdown";

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

const inputClass = (hasError: boolean) =>
  `block w-full rounded-lg border bg-paper px-3 py-2 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-ink/20 ${
    hasError
      ? "border-stamp-red focus:border-stamp-red"
      : "border-paper-line focus:border-ink"
  }`;

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft";

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

  const setField = (name: keyof ScheduleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setField(e.target.name as keyof ScheduleFormData, e.target.value);
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

  const employeeOptions = employees.map((employee) => ({
    value: employee.ssn.toString(),
    label: `${employee.person_name} — ${employee.role}`,
  }));
  const facilityOptions = facilities.map((facility) => ({
    value: facility.fid.toString(),
    label: `${facility.name} — ${facility.type} (${facility.city})`,
  }));

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="animate-panel-rise rounded-xl border-[1.5px] border-ink bg-panel p-8">
          <div className="mb-1 flex items-center gap-2.5">
            <span className="text-lg font-bold tracking-tight text-ink">
              HMS
            </span>
            <h1 className="text-xl font-bold text-ink">Add Work Schedule</h1>
          </div>
          <div className="mb-8 flex items-center gap-1.5 border-b border-paper-line pb-6 text-sm text-ink-soft">
            <CalendarIcon className="h-4 w-4" aria-hidden="true" />
            Schedule a shift for an employee at a facility.
          </div>

          {errors.general && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-stamp-red/30 bg-stamp-red/5 px-4 py-3 text-sm font-medium text-stamp-red-ink"
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <div>
                <label htmlFor="essn" className={labelClass}>
                  Select Employee *
                </label>
                {employeesLoading ? (
                  <div className="text-sm text-ink-soft">
                    Loading employees…
                  </div>
                ) : (
                  <Dropdown
                    id="essn"
                    value={formData.essn}
                    onChange={(value) => setField("essn", value)}
                    options={employeeOptions}
                    placeholder="-- Select an employee --"
                  />
                )}
                {errors.essn && (
                  <p className="mt-1 text-sm text-stamp-red-ink">
                    {errors.essn}
                  </p>
                )}
                <p className="mt-1.5 text-sm text-ink-soft">
                  Select the employee to schedule
                </p>
              </div>

              <div>
                <label htmlFor="fid" className={labelClass}>
                  Select Facility *
                </label>
                {facilitiesLoading ? (
                  <div className="text-sm text-ink-soft">
                    Loading facilities…
                  </div>
                ) : (
                  <Dropdown
                    id="fid"
                    value={formData.fid}
                    onChange={(value) => setField("fid", value)}
                    options={facilityOptions}
                    placeholder="-- Select a facility --"
                  />
                )}
                {errors.fid && (
                  <p className="mt-1 text-sm text-stamp-red-ink">
                    {errors.fid}
                  </p>
                )}
                <p className="mt-1.5 text-sm text-ink-soft">
                  Select the facility where the employee will work
                </p>
              </div>

              <div>
                <label htmlFor="date" className={labelClass}>
                  Work Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={inputClass(!!errors.date)}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-stamp-red-ink">
                    {errors.date}
                  </p>
                )}
                <p className="mt-1.5 text-sm text-ink-soft">
                  Date of the scheduled shift
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="start_time" className={labelClass}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    id="start_time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    className={inputClass(!!errors.start_time)}
                  />
                  {errors.start_time && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.start_time}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="end_time" className={labelClass}>
                    End Time
                  </label>
                  <input
                    type="time"
                    id="end_time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    className={inputClass(!!errors.end_time)}
                  />
                  {errors.end_time && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.end_time}
                    </p>
                  )}
                  <p className="mt-1.5 text-sm text-ink-soft">
                    Leave empty for open-ended shift
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end space-x-3 border-t border-paper-line pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-paper-line px-6 py-2 font-medium text-ink transition-colors hover:bg-ink/[0.04] focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || employeesLoading || facilitiesLoading}
                className="rounded-lg bg-ink px-6 py-2 font-medium text-paper shadow-sm transition-all duration-200 hover:bg-ink/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Adding…" : "Add Schedule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSchedule;
