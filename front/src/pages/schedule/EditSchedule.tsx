import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/Dropdown";

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

const inputClass = (hasError: boolean) =>
  `block w-full rounded-lg border bg-paper px-3 py-2 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-ink/20 ${
    hasError
      ? "border-stamp-red focus:border-stamp-red"
      : "border-paper-line focus:border-ink"
  }`;

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft";

const EditSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { person_uuid, fid, date, start_time } = useParams<{
    person_uuid: string;
    fid: string;
    date: string;
    start_time: string;
  }>();
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
      if (!person_uuid || !fid || !date || !start_time) {
        navigate("/schedules");
        return;
      }

      try {
        const [scheduleResponse, facilitiesResponse] = await Promise.all([
          axios.get(
            API_ENDPOINTS.scheduleDetail(person_uuid, fid, date, start_time),
          ),
          axios.get(API_ENDPOINTS.facilities),
        ]);
        setFormData(scheduleResponse.data);
        setEmployeeName(scheduleResponse.data.employee_name || "");
        setEmployeeRole(scheduleResponse.data.employee_role || "");
        setFacilities(
          facilitiesResponse.data.results || facilitiesResponse.data,
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ general: "Failed to load schedule data." });
      } finally {
        setInitialLoading(false);
        setFacilitiesLoading(false);
      }
    };

    fetchData();
  }, [person_uuid, fid, date, start_time, navigate]);

  const clearFieldError = (name: string) => {
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || null }));
    clearFieldError(name);
  };

  const handleFacilityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, fid: parseInt(value, 10) }));
    clearFieldError("fid");
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
      await axios.put(
        API_ENDPOINTS.scheduleDetail(person_uuid!, fid!, date!, start_time!),
        {
          essn: formData.essn,
          fid: formData.fid,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
        },
      );
      navigate("/schedules", {
        state: { message: "Schedule updated successfully!" },
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
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
        setErrors({ general: "Failed to update schedule. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/schedules");
  };

  const facilityOptions = facilities.map((facility) => ({
    value: facility.fid.toString(),
    label: `${facility.name} — ${facility.type} (${facility.city})`,
  }));

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
            role="status"
            aria-label="Loading schedule data"
          ></div>
          <p className="mt-4 text-sm text-ink-soft">Loading schedule data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="badge-card p-8">
          <div className="mb-1 flex items-center gap-2.5">
            <PencilSquareIcon className="h-5 w-5 text-ink" aria-hidden="true" />
            <h1 className="text-xl font-bold text-ink">Edit Work Schedule</h1>
          </div>
          <p className="mb-8 border-b border-paper-line pb-6 text-sm text-ink-soft">
            Update this shift's facility, date, or time.
          </p>

          {errors.general && (
            <div
              role="alert"
              className="mb-6 rounded border border-stamp-red/30 bg-stamp-red/5 px-4 py-3 text-sm font-medium text-stamp-red-ink"
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <div className="rounded border border-paper-line bg-ink/[0.03] p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Schedule Information
                </h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-20 flex-shrink-0 font-medium text-ink-soft">
                      Employee
                    </dt>
                    <dd className="text-ink">{employeeName}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 flex-shrink-0 font-medium text-ink-soft">
                      Role
                    </dt>
                    <dd className="text-ink">{employeeRole}</dd>
                  </div>
                </dl>
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
                    value={formData.fid ? formData.fid.toString() : ""}
                    onChange={handleFacilityChange}
                    options={facilityOptions}
                    placeholder="-- Select a facility --"
                  />
                )}
                {errors.fid && (
                  <p className="mt-1 text-sm text-stamp-red-ink">
                    {errors.fid}
                  </p>
                )}
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
                    value={formData.end_time || ""}
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
                className="rounded border-[1.5px] border-paper-line px-6 py-2 font-medium text-ink transition-colors hover:bg-ink/[0.04] focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || facilitiesLoading}
                className="rounded border-[1.5px] border-ink bg-ink px-6 py-2 font-medium text-paper transition-colors hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Updating…" : "Update Schedule"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSchedule;
