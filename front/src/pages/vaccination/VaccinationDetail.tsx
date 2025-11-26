import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import {
  ShieldCheckIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface VaccinationData {
  ssn: number;
  type_id: number;
  date: string;
  no_of_dose: number | null;
  fid: number | null;
  person_name: string;
  vaccine_type_name: string;
  facility_name: string;
}

const VaccinationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vaccination, setVaccination] = useState<VaccinationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVaccination = async () => {
      if (!id) {
        navigate("/vaccinations");
        return;
      }

      try {
        const response = await axios.get(`${API_ENDPOINTS.vaccinations}${id}/`);
        setVaccination(response.data);
      } catch (error) {
        console.error("Error fetching vaccination:", error);
        setError("Failed to load vaccination details");
      } finally {
        setLoading(false);
      }
    };

    fetchVaccination();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vaccination details...</p>
        </div>
      </div>
    );
  }

  if (error || !vaccination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Vaccination record not found"}
          </p>
          <Link
            to="/vaccinations"
            className="text-green-600 hover:text-green-700"
          >
            Back to Vaccinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/vaccinations"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Vaccinations
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-10 w-10 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Vaccination Record Details
                </h1>
                <p className="text-gray-500">Record ID: {id}</p>
              </div>
            </div>
            <Link
              to={`/vaccinations/${id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <PencilSquareIcon className="h-5 w-5 mr-2" />
              Edit
            </Link>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Person Name
              </h3>
              <p className="text-lg text-gray-900">{vaccination.person_name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                SSN
              </h3>
              <p className="text-lg text-gray-900">{vaccination.ssn}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Vaccine Type
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {vaccination.vaccine_type_name}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Vaccination Date
              </h3>
              <p className="text-lg text-gray-900">
                {formatDate(vaccination.date)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Dose Number
              </h3>
              <p className="text-lg text-gray-900">
                {vaccination.no_of_dose
                  ? `Dose ${vaccination.no_of_dose}`
                  : "N/A"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Facility
              </h3>
              <p className="text-lg text-gray-900">
                {vaccination.facility_name || "N/A"}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Additional Information
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> This record indicates that{" "}
                {vaccination.person_name} received{" "}
                {vaccination.no_of_dose
                  ? `dose ${vaccination.no_of_dose} of `
                  : ""}
                {vaccination.vaccine_type_name.toLowerCase()} on{" "}
                {formatDate(vaccination.date)}
                {vaccination.facility_name
                  ? ` at ${vaccination.facility_name}`
                  : ""}
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccinationDetail;
