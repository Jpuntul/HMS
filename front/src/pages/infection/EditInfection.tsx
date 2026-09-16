import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/Dropdown";
import FormCheck from "../../components/FormCheck";

interface InfectionType {
  type_id: number;
  type_name: string;
}

interface InfectionFormData {
  ssn: number;
  date: string;
  type_id: number;
  person_name?: string;
  infection_type_name?: string;
}

const EditInfection: React.FC = () => {
  const navigate = useNavigate();
  const { person_uuid, date, type_id } = useParams<{
    person_uuid: string;
    date: string;
    type_id: string;
  }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [infectionTypes, setInfectionTypes] = useState<InfectionType[]>([]);
  const [formData, setFormData] = useState<InfectionFormData>({
    ssn: 0,
    date: "",
    type_id: 0,
  });
  const [personName, setPersonName] = useState<string>("");

  // Load infection data and types when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!person_uuid || !date || !type_id) {
        navigate("/infections");
        return;
      }

      try {
        const [infectionResponse, typesResponse] = await Promise.all([
          axios.get(API_ENDPOINTS.infectionDetail(person_uuid, date, type_id)),
          axios.get(API_ENDPOINTS.infectionTypes),
        ]);
        setFormData(infectionResponse.data);
        setPersonName(infectionResponse.data.person_name || "");
        setInfectionTypes(typesResponse.data.results || typesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ general: "Failed to load infection data." });
      } finally {
        setInitialLoading(false);
        setTypesLoading(false);
      }
    };

    fetchData();
  }, [person_uuid, date, type_id, navigate]);

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

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type_id: parseInt(value) }));
    if (errors.type_id) {
      setErrors((prev) => ({ ...prev, type_id: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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
      await axios.put(
        API_ENDPOINTS.infectionDetail(person_uuid!, date!, type_id!),
        {
          ssn: formData.ssn,
          date: formData.date,
          type_id: formData.type_id,
        },
      );
      navigate("/infections", {
        state: { message: "Infection record updated successfully!" },
      });
    } catch (error) {
      console.error("Error updating infection:", error);
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
          general: "Failed to update infection record. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/infections");
  };

  const typeOptions = infectionTypes.map((type) => ({
    value: type.type_id.toString(),
    label: type.type_name,
  }));

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
            role="status"
            aria-label="Loading infection data"
          ></div>
          <p className="mt-4 text-sm text-ink-soft">
            Loading infection data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="badge-card p-8">
          <div className="mb-1 flex items-center gap-2.5">
            <PencilSquareIcon className="h-6 w-6 text-ink" />
            <h1 className="text-xl font-bold text-ink">
              Edit Infection Record
            </h1>
          </div>
          <p className="mb-6 border-b border-paper-line pb-6 text-sm text-ink-soft">
            Update this patient's infection case.
          </p>

          {errors.general && (
            <div className="mb-6 rounded border border-stamp-red/30 bg-stamp-red/5 px-4 py-3 text-sm font-medium text-stamp-red-ink">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="rounded border border-paper-line bg-ink/[0.03] p-4">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <FormCheck className="h-3.5 w-3.5" />
                Infection Information
              </h3>
              <p className="text-sm text-ink">
                <span className="font-semibold">Person:</span> {personName}
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
                  value={formData.type_id ? formData.type_id.toString() : ""}
                  onChange={handleTypeChange}
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
                className="block w-full rounded-lg border border-paper-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-stamp-red-ink">{errors.date}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 border-t border-paper-line pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded border-[1.5px] border-paper-line px-6 py-2 text-ink-soft transition-colors hover:bg-ink/[0.04] focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || typesLoading}
                className="rounded border-[1.5px] border-ink bg-ink px-6 py-2 text-paper transition-colors hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Infection Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditInfection;
