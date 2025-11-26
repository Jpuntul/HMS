import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

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
  ssn: number;
  type_id: number;
  date: string;
  no_of_dose: number | null;
  fid: number | null;
  person_name?: string;
  vaccine_type_name?: string;
  facility_name?: string;
}

const EditVaccination: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [formData, setFormData] = useState<VaccinationFormData>({
    ssn: 0,
    type_id: 0,
    date: "",
    no_of_dose: null,
    fid: null,
  });
  const [personName, setPersonName] = useState<string>("");

  // Load vaccination data, types, and facilities when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        navigate("/vaccinations");
        return;
      }

      try {
        const [vaccinationResponse, typesResponse, facilitiesResponse] =
          await Promise.all([
            axios.get(`${API_ENDPOINTS.vaccinations}${id}/`),
            axios.get(API_ENDPOINTS.vaccineTypes),
            axios.get(API_ENDPOINTS.facilities),
          ]);
        setFormData(vaccinationResponse.data);
        setPersonName(vaccinationResponse.data.person_name || "");
        setVaccineTypes(typesResponse.data.results || typesResponse.data);
        setFacilities(
          facilitiesResponse.data.results || facilitiesResponse.data,
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ general: "Failed to load vaccination data." });
      } finally {
        setInitialLoading(false);
        setTypesLoading(false);
        setFacilitiesLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "type_id" || name === "fid"
          ? value
            ? parseInt(value)
            : null
          : name === "no_of_dose"
          ? value
            ? parseInt(value)
            : null
          : value,
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
      await axios.put(`${API_ENDPOINTS.vaccinations}${id}/`, {
        ssn: formData.ssn,
        type_id: formData.type_id,
        date: formData.date,
        no_of_dose: formData.no_of_dose,
        fid: formData.fid,
      });
      navigate("/vaccinations", {
        state: { message: "Vaccination record updated successfully!" },
      });
    } catch (error) {
      console.error("Error updating vaccination:", error);
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
          general: "Failed to update vaccination record. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/vaccinations");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vaccination data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <PencilSquareIcon className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Vaccination Record
            </h1>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Vaccination Information
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Person:</strong> {personName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>SSN:</strong> {formData.ssn}
              </p>
            </div>

            <div>
              <label
                htmlFor="type_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Vaccine Type *
              </label>
              {typesLoading ? (
                <div className="text-gray-500">Loading vaccine types...</div>
              ) : (
                <select
                  id="type_id"
                  name="type_id"
                  value={formData.type_id || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.type_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select vaccine type --</option>
                  {vaccineTypes.map((type) => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              )}
              {errors.type_id && (
                <p className="mt-1 text-sm text-red-600">{errors.type_id}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Vaccination Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                max={new Date().toISOString().split("T")[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="no_of_dose"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Dose Number
              </label>
              <input
                type="number"
                id="no_of_dose"
                name="no_of_dose"
                value={formData.no_of_dose || ""}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 1, 2, 3"
              />
              {errors.no_of_dose && (
                <p className="mt-1 text-sm text-red-600">{errors.no_of_dose}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Which dose in the series (optional)
              </p>
            </div>

            <div>
              <label
                htmlFor="fid"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Facility
              </label>
              {facilitiesLoading ? (
                <div className="text-gray-500">Loading facilities...</div>
              ) : (
                <select
                  id="fid"
                  name="fid"
                  value={formData.fid || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">-- Select facility (optional) --</option>
                  {facilities.map((facility) => (
                    <option key={facility.fid} value={facility.fid}>
                      {facility.name} - {facility.type} ({facility.city})
                    </option>
                  ))}
                </select>
              )}
              {errors.fid && (
                <p className="mt-1 text-sm text-red-600">{errors.fid}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Where the vaccination was administered (optional)
              </p>
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
                disabled={loading || typesLoading || facilitiesLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Vaccination Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVaccination;
