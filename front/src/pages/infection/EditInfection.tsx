import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

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
  const { id } = useParams<{ id: string }>();
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
      if (!id) {
        navigate("/infections");
        return;
      }

      try {
        const [infectionResponse, typesResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.infections}${id}/`),
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
  }, [id, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "type_id" ? parseInt(value) : value,
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
      await axios.put(`${API_ENDPOINTS.infections}${id}/`, {
        ssn: formData.ssn,
        date: formData.date,
        type_id: formData.type_id,
      });
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading infection data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <PencilSquareIcon className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Infection Record
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
                Infection Information
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
                Infection Type *
              </label>
              {typesLoading ? (
                <div className="text-gray-500">Loading infection types...</div>
              ) : (
                <select
                  id="type_id"
                  name="type_id"
                  value={formData.type_id}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.type_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select infection type --</option>
                  {infectionTypes.map((type) => (
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
                Infection Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                max={new Date().toISOString().split("T")[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
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
                disabled={loading || typesLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
