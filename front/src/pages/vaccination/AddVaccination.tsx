import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

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
        setErrors(error.response.data);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Add Vaccination Record
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
                Select the person who received the vaccination
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
                  value={formData.type_id}
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
              <p className="mt-1 text-sm text-gray-500">
                Date when the vaccination was administered
              </p>
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
                value={formData.no_of_dose}
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
                  value={formData.fid}
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
                disabled={
                  loading || personsLoading || typesLoading || facilitiesLoading
                }
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
