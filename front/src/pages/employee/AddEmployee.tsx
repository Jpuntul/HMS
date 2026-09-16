import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/Dropdown";

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

  const setField = (name: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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

  // Name only, never the raw SSN - a person's name plus DOB-less
  // disambiguation is enough for this picker without exposing PII in a
  // dropdown label (see todo/ux_accessibility_todo.md).
  const personOptions = persons.map((person) => ({
    value: String(person.ssn),
    label: `${person.first_name} ${person.last_name}`,
  }));

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="badge-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <UserPlusIcon className="h-7 w-7 flex-shrink-0 text-ink" />
            <h1 className="text-2xl font-bold text-ink">Add New Employee</h1>
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
            <div>
              <label
                htmlFor="ssn"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
              >
                Select Person *
              </label>
              {personsLoading ? (
                <div className="text-sm text-ink-soft">
                  Loading persons&hellip;
                </div>
              ) : (
                <Dropdown
                  id="ssn"
                  value={formData.ssn}
                  onChange={(value) => setField("ssn", value)}
                  options={personOptions}
                  placeholder="-- Select a person --"
                />
              )}
              {errors.ssn && (
                <p className="mt-1 text-sm text-stamp-red-ink">{errors.ssn}</p>
              )}
              <p className="mt-1 text-sm text-ink-soft">
                Select the person who will become an employee
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
                onChange={(value) => setField("role", value)}
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
                disabled={loading || personsLoading}
                className="rounded border-[1.5px] border-ink bg-ink px-6 py-2 text-paper transition-colors hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
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
