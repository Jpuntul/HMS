import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Person {
  ssn: number;
  first_name: string;
  last_name: string;
  medicare: string;
}

interface InfectionType {
  id: number;
  name: string;
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
          axios.get(`${API_ENDPOINTS.infections}types/`),
        ]);
        setPersons(personsResponse.data);
        setInfectionTypes(typesResponse.data);
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
        setErrors(error.response.data);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Add Infection Record
            </h1>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="ssn"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Person *
              </label>
              {personsLoading ? (
                <div className="text-gray-500">Loading persons...</div>
              ) : (
                <select
                  id="ssn"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.ssn ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select a person --</option>
                  {persons.map((person) => (
                    <option key={person.ssn} value={person.ssn}>
                      {person.first_name} {person.last_name} (SSN: {person.ssn})
                    </option>
                  ))}
                </select>
              )}
              {errors.ssn && (
                <p className="mt-1 text-sm text-red-600">{errors.ssn}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Select the person who has the infection
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
                    <option key={type.id} value={type.id}>
                      {type.name}
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
              <p className="mt-1 text-sm text-gray-500">
                Date when the infection was diagnosed
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
                disabled={loading || personsLoading || typesLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
