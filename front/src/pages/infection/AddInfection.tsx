import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/Dropdown";

interface Person {
  ssn: number;
  first_name: string;
  last_name: string;
  medicare: string;
}

interface InfectionType {
  type_id: number;
  type_name: string;
}

interface InfectionFormData {
  ssn: string;
  date: string;
  type_id: string;
}

const AddInfection: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [personsLoading, setPersonsLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [persons, setPersons] = useState<Person[]>([]);
  const [infectionTypes, setInfectionTypes] = useState<InfectionType[]>([]);
  const [formData, setFormData] = useState<InfectionFormData>({
    ssn: "",
    date: "",
    type_id: "",
  });

  // Load available persons and infection types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personsResponse, typesResponse] = await Promise.all([
          axios.get(API_ENDPOINTS.persons),
          axios.get(API_ENDPOINTS.infectionTypes),
        ]);
        setPersons(personsResponse.data.results || personsResponse.data);
        setInfectionTypes(typesResponse.data.results || typesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ general: "Failed to load required data." });
      } finally {
        setPersonsLoading(false);
        setTypesLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ssn) newErrors.ssn = "Please select a person";
    if (!formData.date) newErrors.date = "Infection date is required";
    if (!formData.type_id) newErrors.type_id = "Please select infection type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.post(API_ENDPOINTS.infections, formData);
      navigate("/infections", {
        state: { message: "Infection record added successfully!" },
      });
    } catch (error) {
      console.error("Error adding infection:", error);
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
        setErrors({
          general: "Failed to add infection record. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/infections");
  };

  const personOptions = persons.map((person) => ({
    value: person.ssn.toString(),
    label: `${person.first_name} ${person.last_name}`,
  }));

  const typeOptions = infectionTypes.map((type) => ({
    value: type.type_id.toString(),
    label: type.type_name,
  }));

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded border-[1.5px] border-ink bg-panel p-8">
          <div className="mb-1 flex items-center gap-2.5">
            <ExclamationTriangleIcon className="h-6 w-6 text-ink" />
            <h1 className="text-xl font-bold text-ink">Add Infection Record</h1>
          </div>
          <p className="mb-6 border-b border-paper-line pb-6 text-sm text-ink-soft">
            Log a new infection case for a patient on file.
          </p>

          {errors.general && (
            <div className="mb-6 rounded border border-stamp-red/30 bg-stamp-red/5 px-4 py-3 text-sm font-medium text-stamp-red-ink">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label
                htmlFor="ssn"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
              >
                Select Person <span className="text-stamp-red-ink">*</span>
              </label>
              {personsLoading ? (
                <div className="text-sm text-ink-soft">Loading persons...</div>
              ) : (
                <Dropdown
                  id="ssn"
                  value={formData.ssn}
                  onChange={(value) => handleFieldChange("ssn", value)}
                  options={personOptions}
                  placeholder="-- Select a person --"
                />
              )}
              {errors.ssn && (
                <p className="mt-1 text-sm text-stamp-red-ink">{errors.ssn}</p>
              )}
              <p className="mt-1 text-sm text-ink-soft">
                Select the person who has the infection
              </p>
            </div>

            <div>
              <label
                htmlFor="type_id"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
              >
                Infection Type <span className="text-stamp-red-ink">*</span>
              </label>
              {typesLoading ? (
                <div className="text-sm text-ink-soft">
                  Loading infection types...
                </div>
              ) : (
                <Dropdown
                  id="type_id"
                  value={formData.type_id}
                  onChange={(value) => handleFieldChange("type_id", value)}
                  options={typeOptions}
                  placeholder="-- Select infection type --"
                />
              )}
              {errors.type_id && (
                <p className="mt-1 text-sm text-stamp-red-ink">
                  {errors.type_id}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="date"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
              >
                Infection Date <span className="text-stamp-red-ink">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                max={new Date().toISOString().split("T")[0]}
                className="block w-full rounded border-[1.5px] border-paper-line bg-panel px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-stamp-red-ink">{errors.date}</p>
              )}
              <p className="mt-1 text-sm text-ink-soft">
                Date when the infection was diagnosed
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 border-t border-paper-line pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded border-[1.5px] border-paper-line px-6 py-2 text-ink-soft transition-colors hover:bg-ink/[0.04] focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || personsLoading || typesLoading}
                className="rounded border-[1.5px] border-ink bg-ink px-6 py-2 text-paper transition-colors hover:bg-ink/90 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Infection Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInfection;
