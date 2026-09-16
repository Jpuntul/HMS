import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/Dropdown";

interface EmployeeFormData {
  ssn: number;
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

const EditEmployee: React.FC = () => {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<EmployeeFormData>({
    ssn: 0,
    role: "",
  });
  const [personName, setPersonName] = useState<string>("");

  // Load employee data when component mounts
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!uuid) {
        navigate("/employees");
        return;
      }

      try {
        const response = await axios.get(API_ENDPOINTS.employeeDetail(uuid));
        setFormData(response.data);
        setPersonName(response.data.person_name || "");
      } catch (error) {
        console.error("Error fetching employee:", error);
        setErrors({ general: "Failed to load employee data." });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEmployee();
  }, [uuid, navigate]);

  const setRole = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.role) newErrors.role = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.put(API_ENDPOINTS.employeeDetail(uuid!), formData);
      navigate("/employees", {
        state: { message: "Employee updated successfully!" },
      });
    } catch (error) {
      console.error("Error updating employee:", error);
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
        setErrors({ general: "Failed to update employee. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/employees");
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
            role="status"
            aria-label="Loading employee data"
          ></div>
          <p className="mt-4 text-ink-soft">Loading employee data&hellip;</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="badge-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <PencilSquareIcon className="h-7 w-7 flex-shrink-0 text-ink" />
            <h1 className="text-2xl font-bold text-ink">Edit Employee</h1>
          </div>

          {errors.general && (
            <div
              role="alert"
              className="mb-6 rounded border border-stamp-red/30 bg-stamp-red/5 px-4 py-3 text-sm font-medium text-stamp-red-ink"
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded border border-paper-line bg-ink/[0.03] p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Employee Information
              </h3>
              <p className="text-sm text-ink">
                <strong>Name:</strong> {personName}
              </p>
              <p className="mt-0.5 font-mono text-xs tracking-wide text-ink-soft">
                NO. {uuid?.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
              >
                Employee Role *
              </label>
              <Dropdown
                id="role"
                value={formData.role}
                onChange={setRole}
                options={ROLE_CHOICES}
                placeholder="-- Select a role --"
              />
              {errors.role && (
                <p className="mt-1 text-sm text-stamp-red-ink">{errors.role}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 border-t border-paper-line pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded border-[1.5px] border-paper-line px-6 py-2 text-ink-soft transition-colors hover:bg-ink/[0.04] focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded border-[1.5px] border-ink bg-ink px-6 py-2 text-paper transition-colors hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Employee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEmployee;
