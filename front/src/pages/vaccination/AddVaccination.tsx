import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/Dropdown";

interface Person {
  ssn: number;
  first_name: string;
  last_name: string;
  medicare: string;
}

interface VaccineType {
  type_id: number;
  type_name: string;
}

interface Facility {
  fid: number;
  name: string;
  type: string;
  city: string;
}

interface VaccinationFormData {
  ssn: string;
  type_id: string;
  date: string;
  no_of_dose: string;
  fid: string;
}

const AddVaccination: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [personsLoading, setPersonsLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [persons, setPersons] = useState<Person[]>([]);
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [formData, setFormData] = useState<VaccinationFormData>({
    ssn: "",
    type_id: "",
    date: "",
    no_of_dose: "",
    fid: "",
  });

  // Load available persons, vaccine types, and facilities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personsResponse, typesResponse, facilitiesResponse] =
          await Promise.all([
            axios.get(API_ENDPOINTS.persons),
            axios.get(API_ENDPOINTS.vaccineTypes),
            axios.get(API_ENDPOINTS.facilities),
          ]);
        setPersons(personsResponse.data.results || personsResponse.data);
        setVaccineTypes(typesResponse.data.results || typesResponse.data);
        setFacilities(
          facilitiesResponse.data.results || facilitiesResponse.data,
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ general: "Failed to load required data." });
      } finally {
        setPersonsLoading(false);
        setTypesLoading(false);
        setFacilitiesLoading(false);
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
    if (!formData.type_id) newErrors.type_id = "Please select vaccine type";
    if (!formData.date) newErrors.date = "Vaccination date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ssn: formData.ssn,
        type_id: formData.type_id,
        date: formData.date,
        no_of_dose: formData.no_of_dose ? parseInt(formData.no_of_dose) : null,
        fid: formData.fid || null,
      };
      await axios.post(API_ENDPOINTS.vaccinations, submitData);
      navigate("/vaccinations", {
        state: { message: "Vaccination record added successfully!" },
      });
    } catch (error) {
      console.error("Error adding vaccination:", error);
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
          general: "Failed to add vaccination record. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/vaccinations");
  };

  const personOptions = persons.map((person) => ({
    value: person.ssn.toString(),
    label: `${person.first_name} ${person.last_name}`,
  }));

  const typeOptions = vaccineTypes.map((type) => ({
    value: type.type_id.toString(),
    label: type.type_name,
  }));

  const facilityOptions = facilities.map((facility) => ({
    value: facility.fid.toString(),
    label: `${facility.name} - ${facility.type} (${facility.city})`,
  }));

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="badge-card p-8">
          <div className="mb-1 flex items-center gap-2.5">
            <ShieldCheckIcon className="h-6 w-6 text-ink" />
            <h1 className="text-xl font-bold text-ink">
              Add Vaccination Record
            </h1>
          </div>
          <p className="mb-6 border-b border-paper-line pb-6 text-sm text-ink-soft">
            Log a new vaccination dose for a patient on file.
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
                Select the person who received the vaccination
              </p>
            </div>

            <div>
              <label
                htmlFor="type_id"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
              >
                Vaccine Type <span className="text-stamp-red-ink">*</span>
              </label>
              {typesLoading ? (
                <div className="text-sm text-ink-soft">
                  Loading vaccine types...
                </div>
              ) : (
                <Dropdown
                  id="type_id"
                  value={formData.type_id}
                  onChange={(value) => handleFieldChange("type_id", value)}
                  options={typeOptions}
                  placeholder="-- Select vaccine type --"
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
                Vaccination Date <span className="text-stamp-red-ink">*</span>
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
              <p className="mt-1 text-sm text-ink-soft">
                Date when the vaccination was administered
              </p>
            </div>

            <div>
              <label
                htmlFor="no_of_dose"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
              >
                Dose Number
              </label>
              <input
                type="number"
                id="no_of_dose"
                name="no_of_dose"
                value={formData.no_of_dose}
                onChange={handleInputChange}
                min="1"
                className="block w-full rounded-lg border border-paper-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                placeholder="e.g., 1, 2, 3"
              />
              {errors.no_of_dose && (
                <p className="mt-1 text-sm text-stamp-red-ink">
                  {errors.no_of_dose}
                </p>
              )}
              <p className="mt-1 text-sm text-ink-soft">
                Which dose in the series (optional)
              </p>
            </div>

            <div>
              <label
                htmlFor="fid"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
              >
                Facility
              </label>
              {facilitiesLoading ? (
                <div className="text-sm text-ink-soft">
                  Loading facilities...
                </div>
              ) : (
                <Dropdown
                  id="fid"
                  value={formData.fid}
                  onChange={(value) => handleFieldChange("fid", value)}
                  options={facilityOptions}
                  placeholder="-- Select facility (optional) --"
                />
              )}
              {errors.fid && (
                <p className="mt-1 text-sm text-stamp-red-ink">{errors.fid}</p>
              )}
              <p className="mt-1 text-sm text-ink-soft">
                Where the vaccination was administered (optional)
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 border-t border-paper-line pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-paper-line px-6 py-2 text-ink-soft transition-colors hover:bg-ink/[0.04] focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading || personsLoading || typesLoading || facilitiesLoading
                }
                className="rounded border-[1.5px] border-ink bg-ink px-6 py-2 text-paper transition-colors hover:bg-ink/90 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Vaccination Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVaccination;
