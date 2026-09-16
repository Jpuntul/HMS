import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS, ROUTES } from "../../config/api";
import {
  UserIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import StatusStamp from "../../components/StatusStamp";

interface PersonData {
  ssn: number;
  medicare: string;
  first_name: string;
  last_name: string;
  dob: string;
  telephone: string;
  citizenship: string;
  email: string;
  occupation: string;
}

const Field: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {label}
    </h3>
    <p className="text-lg text-ink">{value}</p>
  </div>
);

const PersonDetail: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerson = async () => {
      if (!uuid) {
        navigate("/persons");
        return;
      }

      try {
        const response = await axios.get(API_ENDPOINTS.personDetail(uuid));
        setPerson(response.data);
      } catch (error) {
        console.error("Error fetching person:", error);
        setError("Failed to load person details");
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [uuid, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (dobString: string) => {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
            role="status"
            aria-label="Loading person details"
          ></div>
          <p className="mt-4 text-ink-soft">Loading person details&hellip;</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <p className="mb-4 text-stamp-red-ink">
            {error || "Person not found"}
          </p>
          <Link to="/persons" className="text-ink underline hover:text-ink/80">
            Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/persons"
            className="mb-4 inline-flex items-center text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserIcon className="h-8 w-8 flex-shrink-0 text-ink" />
              <div>
                <h1 className="text-2xl font-bold text-ink">
                  {person.first_name} {person.last_name}
                </h1>
                <p className="font-mono text-xs tracking-wide text-ink-soft">
                  NO. {uuid?.slice(0, 8).toUpperCase()} ·{" "}
                  {calculateAge(person.dob)} years old
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.personEdit(uuid!)}
              className="flex flex-none items-center gap-2 whitespace-nowrap rounded border-[1.5px] border-ink bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-ink/90"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Details Panel */}
        <div className="badge-card p-8">
          <div className="mb-6 flex items-start justify-between gap-2 border-b border-paper-line pb-4">
            <span className="text-lg font-bold text-ink">
              {person.first_name} {person.last_name}
            </span>
            <StatusStamp label="On File" tone="verified" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="First Name" value={person.first_name} />
            <Field label="Last Name" value={person.last_name} />
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Date of Birth
              </h3>
              <p className="text-lg text-ink">{formatDate(person.dob)}</p>
              <p className="text-sm text-ink-soft">
                Age: {calculateAge(person.dob)}
              </p>
            </div>
            <Field label="Citizenship" value={person.citizenship || "N/A"} />
            <Field label="Occupation" value={person.occupation || "N/A"} />
            <Field label="Email" value={person.email || "N/A"} />
            <Field label="Phone" value={person.telephone || "N/A"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;
