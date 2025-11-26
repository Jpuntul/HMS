import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import {
  BuildingOffice2Icon,
  PencilSquareIcon,
  ArrowLeftIcon,
  GlobeAltIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

interface FacilityData {
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
  general_manager_name: string;
}

const FacilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [facility, setFacility] = useState<FacilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacility = async () => {
      if (!id) {
        navigate("/facilities");
        return;
      }

      try {
        const response = await axios.get(`${API_ENDPOINTS.facilities}${id}/`);
        setFacility(response.data);
      } catch (error) {
        console.error("Error fetching facility:", error);
        setError("Failed to load facility details");
      } finally {
        setLoading(false);
      }
    };

    fetchFacility();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading facility details...</p>
        </div>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Facility not found"}</p>
          <Link
            to="/facilities"
            className="text-purple-600 hover:text-purple-700"
          >
            Back to Facilities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/facilities"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Facilities
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BuildingOffice2Icon className="h-10 w-10 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {facility.name}
                </h1>
                <p className="text-gray-500">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mt-2">
                    {facility.type}
                  </span>
                </p>
              </div>
            </div>
            <Link
              to={`/facilities/${id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <PencilSquareIcon className="h-5 w-5 mr-2" />
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Facility Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Facility ID
                </h3>
                <p className="text-lg text-gray-900">{facility.fid}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Capacity
                </h3>
                <p className="text-lg text-gray-900">
                  {facility.capacity || "N/A"}
                </p>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  General Manager
                </h3>
                <p className="text-lg text-gray-900">
                  {facility.general_manager_name}
                </p>
                <p className="text-sm text-gray-500">SSN: {facility.gmssn}</p>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Contact
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <PhoneIcon className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="text-gray-900">{facility.phone_number}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <GlobeAltIcon className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Website</h3>
                  <a
                    href={facility.web_address}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline break-all"
                  >
                    {facility.web_address}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Address
                  </h3>
                  <p className="text-gray-900">{facility.address}</p>
                  <p className="text-gray-900">
                    {facility.city}, {facility.province}
                  </p>
                  <p className="text-gray-900">{facility.postal_code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetail;
