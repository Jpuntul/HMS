import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/Dropdown";

interface Person {
  ssn: number;
  first_name: string;
  last_name: string;
}

interface FacilityFormData {
  fid: number;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone_number: string;
  web_address: string;
  type: string;
  capacity: number | null;
  gmssn: number;
}

const TYPE_CHOICES = [
  { value: "Hospital", label: "Hospital" },
  { value: "CLSC", label: "CLSC" },
  { value: "Clinic", label: "Clinic" },
  { value: "Pharmacy", label: "Pharmacy" },
  { value: "Special installment", label: "Special Installment" },
];

const fieldClass = (hasError: boolean) =>
  `block w-full border-0 border-b-2 bg-transparent px-0 py-2 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-0 disabled:opacity-50 ${
    hasError ? "border-stamp-red" : "border-paper-line focus:border-ink"
  }`;

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft";

const EditFacility: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [personsLoading, setPersonsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [persons, setPersons] = useState<Person[]>([]);
  const [formData, setFormData] = useState<FacilityFormData>({
    fid: 0,
    name: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    phone_number: "",
    web_address: "",
    type: "",
    capacity: null,
    gmssn: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        navigate("/facilities");
        return;
      }

      try {
        const [facilityRes, personsRes] = await Promise.all([
          axios.get(`${API_ENDPOINTS.facilities}${id}/`),
          axios.get(API_ENDPOINTS.persons),
        ]);
        setFormData(facilityRes.data);
        setPersons(personsRes.data.results || personsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ general: "Failed to load facility data." });
      } finally {
        setInitialLoading(false);
        setPersonsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFieldChange = (
    name: keyof FacilityFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as string]) {
      setErrors((prev) => ({ ...prev, [name as string]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Facility name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.province.trim()) newErrors.province = "Province is required";
    if (!formData.postal_code.trim())
      newErrors.postal_code = "Postal code is required";
    if (!formData.phone_number.trim())
      newErrors.phone_number = "Phone number is required";
    if (!formData.web_address.trim())
      newErrors.web_address = "Web address is required";
    if (!formData.type) newErrors.type = "Facility type is required";
    if (!formData.gmssn) newErrors.gmssn = "General manager is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await axios.put(`${API_ENDPOINTS.facilities}${id}/`, formData);
      navigate("/facilities", {
        state: { message: "Facility updated successfully!" },
      });
    } catch (error) {
      console.error("Error updating facility:", error);
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
        setErrors({ general: "Failed to update facility. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/facilities");
  };

  const managerOptions = persons.map((person) => ({
    value: person.ssn.toString(),
    label: `${person.first_name} ${person.last_name}`,
  }));

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
            role="status"
            aria-label="Loading facility data"
          ></div>
          <p className="mt-4 text-sm text-ink-soft">Loading facility data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-ink/10 bg-paper p-8 shadow-[0_2px_12px_-4px_rgba(14,61,57,0.12)]">
          <div className="mb-6 flex items-center gap-2.5">
            <PencilSquareIcon className="h-6 w-6 text-ink" />
            <h1 className="font-stamp text-xl font-bold uppercase tracking-wide text-ink">
              Edit Facility
            </h1>
          </div>

          {errors.general && (
            <div className="mb-6 rounded-lg border border-stamp-red/30 bg-stamp-red/5 px-4 py-3 text-sm font-medium text-stamp-red-ink">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="mb-4 text-sm font-bold text-ink">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClass}>Facility Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.name)}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Facility Type *</label>
                  <Dropdown
                    value={formData.type}
                    onChange={(v) => handleFieldChange("type", v)}
                    options={TYPE_CHOICES}
                    placeholder="-- Select type --"
                  />
                  {errors.type && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.type}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity || ""}
                    onChange={handleInputChange}
                    className={fieldClass(false)}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-t border-paper-line pt-6">
              <h3 className="mb-4 text-sm font-bold text-ink">
                Address Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClass}>Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.address)}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.city)}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Province *</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.province)}
                  />
                  {errors.province && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.province}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Postal Code *</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.postal_code)}
                    maxLength={6}
                  />
                  {errors.postal_code && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.postal_code}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-paper-line pt-6">
              <h3 className="mb-4 text-sm font-bold text-ink">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.phone_number)}
                    maxLength={10}
                  />
                  {errors.phone_number && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.phone_number}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Website *</label>
                  <input
                    type="url"
                    name="web_address"
                    value={formData.web_address}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.web_address)}
                  />
                  {errors.web_address && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.web_address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* General Manager */}
            <div className="border-t border-paper-line pt-6">
              <h3 className="mb-4 text-sm font-bold text-ink">Management</h3>
              <div>
                <label className={labelClass}>General Manager *</label>
                {personsLoading ? (
                  <div className="text-sm text-ink-soft">
                    Loading persons...
                  </div>
                ) : (
                  <Dropdown
                    value={formData.gmssn ? formData.gmssn.toString() : ""}
                    onChange={(v) => handleFieldChange("gmssn", Number(v))}
                    options={managerOptions}
                    placeholder="-- Select general manager --"
                  />
                )}
                {errors.gmssn && (
                  <p className="mt-1 text-sm text-stamp-red-ink">
                    {errors.gmssn}
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 border-t border-paper-line pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-paper-line px-6 py-2 text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-ink px-6 py-2 font-medium text-paper shadow-sm transition-all duration-200 hover:bg-ink/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Facility"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditFacility;
