import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BuildingOffice2Icon className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Facility
            </h1>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Facility Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter facility name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Facility Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.type ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">-- Select type --</option>
                    {TYPE_CHOICES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="capacity"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Maximum capacity"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="123 Main St"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="province"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Province *
                  </label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.province ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Province"
                  />
                  {errors.province && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.province}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="postal_code"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.postal_code ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="A1B2C3"
                    maxLength={6}
                  />
                  {errors.postal_code && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.postal_code}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.phone_number ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="1234567890"
                    maxLength={10}
                  />
                  {errors.phone_number && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone_number}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="web_address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Website *
                  </label>
                  <input
                    type="url"
                    id="web_address"
                    name="web_address"
                    value={formData.web_address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.web_address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="https://example.com"
                  />
                  {errors.web_address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.web_address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* General Manager */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Management
              </h3>
              <div>
                <label
                  htmlFor="gmssn"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  General Manager *
                </label>
                {personsLoading ? (
                  <div className="text-gray-500">Loading persons...</div>
                ) : (
                  <select
                    id="gmssn"
                    name="gmssn"
                    value={formData.gmssn}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      errors.gmssn ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">-- Select general manager --</option>
                    {persons.map((person) => (
                      <option key={person.ssn} value={person.ssn}>
                        {person.first_name} {person.last_name} (SSN:{" "}
                        {person.ssn})
                      </option>
                    ))}
                  </select>
                )}
                {errors.gmssn && (
                  <p className="mt-1 text-sm text-red-600">{errors.gmssn}</p>
                )}
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
                disabled={loading || personsLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
