import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS, ROUTES } from "../../config/api";
import {
  ExclamationTriangleIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import FormCheck from "../../components/FormCheck";

interface InfectionData {
  ssn: number;
  date: string;
  type_id: number;
  person_name: string;
  infection_type_name: string;
}

const DetailField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      <FormCheck className="h-3.5 w-3.5" />
      {label}
    </h3>
    <div className="text-lg text-ink">{children}</div>
  </div>
);

const InfectionDetail: React.FC = () => {
  const { person_uuid, date, type_id } = useParams<{
    person_uuid: string;
    date: string;
    type_id: string;
  }>();
  const navigate = useNavigate();
  const [infection, setInfection] = useState<InfectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfection = async () => {
      if (!person_uuid || !date || !type_id) {
        navigate("/infections");
        return;
      }

      try {
        const response = await axios.get(
          API_ENDPOINTS.infectionDetail(person_uuid, date, type_id),
        );
        setInfection(response.data);
      } catch (error) {
        console.error("Error fetching infection:", error);
        setError("Failed to load infection details");
      } finally {
        setLoading(false);
      }
    };

    fetchInfection();
  }, [person_uuid, date, type_id, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
            role="status"
            aria-label="Loading infection details"
          ></div>
          <p className="mt-4 text-sm text-ink-soft">
            Loading infection details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !infection) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <p className="mb-4 text-stamp-red-ink">
            {error || "Infection record not found"}
          </p>
          <Link
            to="/infections"
            className="text-ink underline hover:text-ink/80"
          >
            Back to Infections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/infections"
            className="mb-4 inline-flex items-center text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Back to Infections
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-9 w-9 text-ink" />
              <div>
                <h1 className="text-2xl font-bold text-ink">
                  Infection Record Details
                </h1>
                <p className="font-mono text-xs tracking-wide text-ink-soft">
                  NO. {person_uuid?.slice(0, 8).toUpperCase()} ·{" "}
                  {infection.infection_type_name} · {formatDate(infection.date)}
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.infectionEdit(person_uuid!, date!, type_id!)}
              className="flex flex-none items-center gap-2 whitespace-nowrap rounded border-[1.5px] border-ink bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-ink/90"
            >
              <PencilSquareIcon className="h-5 w-5" />
              Edit
            </Link>
          </div>
        </div>

        {/* Details Card */}
        <div className="badge-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailField label="Person Name">
              {infection.person_name}
            </DetailField>
            <DetailField label="Infection Type">
              <span
                className="badge-tag"
                style={{ background: "var(--color-ink-soft)" }}
              >
                {infection.infection_type_name}
              </span>
            </DetailField>
            <DetailField label="Infection Date">
              {formatDate(infection.date)}
            </DetailField>
          </div>

          {/* Additional Information */}
          <div className="mt-8 border-t border-paper-line pt-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink">
              Additional Information
            </h3>
            <div className="rounded border border-pending-amber/30 bg-pending-amber/5 p-4">
              <p className="text-sm text-pending-amber-ink">
                <span className="font-semibold">Note:</span> This record
                indicates that the person was diagnosed with{" "}
                {infection.infection_type_name.toLowerCase()} on{" "}
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
