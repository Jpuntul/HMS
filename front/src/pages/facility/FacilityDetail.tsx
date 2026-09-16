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

/** Facility type -> badge color, same mapping as FacilityCard. */
const TYPE_COLORS: Record<string, string> = {
  Hospital: "var(--color-role-doctor)",
  CLSC: "var(--color-role-nurse)",
  Clinic: "var(--color-verified-green)",
  Pharmacy: "var(--color-role-pharmacist)",
  "Special installment": "var(--color-role-security)",
};

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
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
            role="status"
            aria-label="Loading facility details"
          ></div>
          <p className="mt-4 text-sm text-ink-soft">
            Loading facility details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <p className="mb-4 text-stamp-red-ink">
            {error || "Facility not found"}
          </p>
          <Link
            to="/facilities"
            className="text-ink underline hover:text-ink/80"
          >
            Back to Facilities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/facilities"
            className="mb-4 inline-flex items-center text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Facilities
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BuildingOffice2Icon className="h-9 w-9 flex-shrink-0 text-ink" />
              <div>
                <h1 className="text-2xl font-bold text-ink">{facility.name}</h1>
                <span
                  className="badge-tag mt-1 inline-flex"
                  style={{
                    background:
                      TYPE_COLORS[facility.type] ?? "var(--color-ink-soft)",
                  }}
                >
                  {facility.type}
                </span>
              </div>
            </div>
            <Link
              to={`/facilities/${id}/edit`}
              className="inline-flex flex-none items-center gap-2 rounded border-[1.5px] border-ink bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-ink/90"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Details */}
          <div className="badge-card p-8 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between border-b border-paper-line pb-4">
              <h2 className="text-sm font-bold text-ink">
                Facility Information
              </h2>
              <span
                className="badge-tag"
                style={{ background: "var(--color-verified-green)" }}
              >
                ON FILE
              </span>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Facility ID
                </h3>
                <p className="font-mono text-ink">{facility.fid}</p>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Capacity
                </h3>
                <p className="font-mono text-ink">
                  {facility.capacity || "N/A"}
                </p>
              </div>

              <div className="md:col-span-2">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  General Manager
                </h3>
                <p className="text-ink">{facility.general_manager_name}</p>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="badge-card p-8">
            <h2 className="mb-6 text-sm font-bold text-ink">Contact</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <PhoneIcon className="mt-1 h-4 w-4 text-ink-soft" />
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Phone
                  </h3>
                  <p className="text-ink">{facility.phone_number}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GlobeAltIcon className="mt-1 h-4 w-4 text-ink-soft" />
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Website
                  </h3>
                  <a
                    href={facility.web_address}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-ink underline hover:text-ink/80"
                  >
                    {facility.web_address}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-1 h-4 w-4 text-ink-soft" />
                <div>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    Address
                  </h3>
                  <p className="text-ink">{facility.address}</p>
                  <p className="text-ink">
                    {facility.city}, {facility.province}
                  </p>
                  <p className="text-ink">{facility.postal_code}</p>
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
