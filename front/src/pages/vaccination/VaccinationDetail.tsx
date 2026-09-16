import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS, ROUTES } from "../../config/api";
import {
  ShieldCheckIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import FormCheck from "../../components/FormCheck";

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

const VaccinationDetail: React.FC = () => {
  const { person_uuid, type_id, date } = useParams<{
    person_uuid: string;
    type_id: string;
    date: string;
  }>();
  const navigate = useNavigate();
  const [vaccination, setVaccination] = useState<VaccinationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVaccination = async () => {
      if (!person_uuid || !type_id || !date) {
        navigate("/vaccinations");
        return;
      }

      try {
        const response = await axios.get(
          API_ENDPOINTS.vaccinationDetail(person_uuid, type_id, date),
        );
        setVaccination(response.data);
      } catch (error) {
        console.error("Error fetching vaccination:", error);
        setError("Failed to load vaccination details");
      } finally {
        setLoading(false);
      }
    };

    fetchVaccination();
  }, [person_uuid, type_id, date, navigate]);

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
            aria-label="Loading vaccination details"
          ></div>
          <p className="mt-4 text-sm text-ink-soft">
            Loading vaccination details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !vaccination) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <p className="mb-4 text-stamp-red-ink">
            {error || "Vaccination record not found"}
          </p>
          <Link
            to="/vaccinations"
            className="text-ink underline hover:text-ink/80"
          >
            Back to Vaccinations
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
            to="/vaccinations"
            className="mb-4 inline-flex items-center text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Back to Vaccinations
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="h-9 w-9 text-ink" />
              <div>
                <h1 className="text-2xl font-bold text-ink">
                  Vaccination Record Details
                </h1>
                <p className="font-mono text-xs tracking-wide text-ink-soft">
                  NO. {person_uuid?.slice(0, 8).toUpperCase()} ·{" "}
                  {vaccination.vaccine_type_name} ·{" "}
                  {formatDate(vaccination.date)}
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.vaccinationEdit(person_uuid!, type_id!, date!)}
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
              {vaccination.person_name}
            </DetailField>
            <DetailField label="Vaccine Type">
              <span
                className="badge-tag"
                style={{ background: "var(--color-ink-soft)" }}
              >
                {vaccination.vaccine_type_name}
              </span>
            </DetailField>
            <DetailField label="Vaccination Date">
              {formatDate(vaccination.date)}
            </DetailField>
            <DetailField label="Dose Number">
              {vaccination.no_of_dose
                ? `Dose ${vaccination.no_of_dose}`
                : "N/A"}
            </DetailField>
            <DetailField label="Facility">
              {vaccination.facility_name || "N/A"}
            </DetailField>
          </div>

          {/* Additional Information */}
          <div className="mt-8 border-t border-paper-line pt-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink">
              Additional Information
            </h3>
            <div className="rounded border border-verified-green/30 bg-verified-green/5 p-4">
              <p className="text-sm text-verified-green-ink">
                <span className="font-semibold">Note:</span> This record
                indicates that {vaccination.person_name} received{" "}
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
