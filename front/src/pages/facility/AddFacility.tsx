import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import Dropdown from "../../components/Dropdown";

interface Person {
  ssn: number;
  first_name: string;
  last_name: string;
}

interface FacilityFormData {
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone_number: string;
  web_address: string;
  type: string;
  capacity: string;
  gmssn: string;
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

const AddFacility: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [personsLoading, setPersonsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [persons, setPersons] = useState<Person[]>([]);
  const [formData, setFormData] = useState<FacilityFormData>({
    name: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    phone_number: "",
    web_address: "",
    type: "",
    capacity: "",
    gmssn: "",
  });

  // Load available persons for general manager
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

  const handleFieldChange = (name: keyof FacilityFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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
      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      };
      await axios.post(API_ENDPOINTS.facilities, submitData);
      navigate("/facilities", {
        state: { message: "Facility added successfully!" },
      });
    } catch (error) {
      console.error("Error adding facility:", error);
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
        setErrors({ general: "Failed to add facility. Please try again." });
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

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="badge-card p-8">
          <div className="mb-6 border-b border-paper-line pb-4">
            <h1 className="text-xl font-bold text-ink">Add New Facility</h1>
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
                  <label htmlFor="name" className={labelClass}>
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.name)}
                    placeholder="Enter facility name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="type" className={labelClass}>
                    Facility Type *
                  </label>
                  <Dropdown
                    id="type"
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
                  <label htmlFor="capacity" className={labelClass}>
                    Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className={fieldClass(false)}
                    placeholder="Maximum capacity"
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
                  <label htmlFor="address" className={labelClass}>
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.address)}
                    placeholder="123 Main St"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className={labelClass}>
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.city)}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="province" className={labelClass}>
                    Province *
                  </label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.province)}
                    placeholder="Province"
                  />
                  {errors.province && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.province}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="postal_code" className={labelClass}>
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.postal_code)}
                    placeholder="A1B2C3"
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
                  <label htmlFor="phone_number" className={labelClass}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.phone_number)}
                    placeholder="1234567890"
                    maxLength={10}
                  />
                  {errors.phone_number && (
                    <p className="mt-1 text-sm text-stamp-red-ink">
                      {errors.phone_number}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="web_address" className={labelClass}>
                    Website *
                  </label>
                  <input
                    type="url"
                    id="web_address"
                    name="web_address"
                    value={formData.web_address}
                    onChange={handleInputChange}
                    className={fieldClass(!!errors.web_address)}
                    placeholder="https://example.com"
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
                <label htmlFor="gmssn" className={labelClass}>
                  General Manager *
                </label>
                {personsLoading ? (
                  <div className="text-sm text-ink-soft">
                    Loading persons...
                  </div>
                ) : (
                  <Dropdown
                    id="gmssn"
                    value={formData.gmssn}
                    onChange={(v) => handleFieldChange("gmssn", v)}
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
                disabled={loading || personsLoading}
                className="rounded-lg bg-ink px-6 py-2 font-medium text-paper shadow-sm transition-all duration-200 hover:bg-ink/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Facility"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFacility;
