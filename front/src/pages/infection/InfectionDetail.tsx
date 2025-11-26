import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import {
  ExclamationTriangleIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface InfectionData {
  ssn: number;
  date: string;
  type_id: number;
  person_name: string;
  infection_type_name: string;
}

const InfectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [infection, setInfection] = useState<InfectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfection = async () => {
      if (!id) {
        navigate("/infections");
        return;
      }

      try {
        const response = await axios.get(`${API_ENDPOINTS.infections}${id}/`);
        setInfection(response.data);
      } catch (error) {
        console.error("Error fetching infection:", error);
        setError("Failed to load infection details");
      } finally {
        setLoading(false);
      }
    };

    fetchInfection();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading infection details...</p>
        </div>
      </div>
    );
  }

  if (error || !infection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Infection record not found"}
          </p>
          <Link to="/infections" className="text-red-600 hover:text-red-700">
            Back to Infections
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
            to="/infections"
            className="inline-flex items-center text-red-600 hover:text-red-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Infections
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Infection Record Details
                </h1>
                <p className="text-gray-500">Record ID: {id}</p>
              </div>
            </div>
            <Link
              to={`/infections/${id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
              <p className="text-lg text-gray-900">{infection.person_name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                SSN
              </h3>
              <p className="text-lg text-gray-900">{infection.ssn}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Infection Type
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {infection.infection_type_name}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Infection Date
              </h3>
              <p className="text-lg text-gray-900">
                {formatDate(infection.date)}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Additional Information
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This record indicates that the person was
                diagnosed with {infection.infection_type_name.toLowerCase()} on{" "}
                {formatDate(infection.date)}. Please ensure proper follow-up
                care and monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfectionDetail;
