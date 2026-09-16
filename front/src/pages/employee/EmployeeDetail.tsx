import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS, ROUTES } from "../../config/api";
import {
  UserGroupIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import StatusStamp from "../../components/StatusStamp";
import { roleMeta } from "../../utils/roleMeta";

interface EmployeeData {
  role: string;
  person_name: string;
  person_email: string;
  person_phone: string;
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

const EmployeeDetail: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!uuid) {
        navigate("/employees");
        return;
      }

      try {
        const response = await axios.get(API_ENDPOINTS.employeeDetail(uuid));
        setEmployee(response.data);
      } catch (error) {
        console.error("Error fetching employee:", error);
        setError("Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [uuid, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
            role="status"
            aria-label="Loading employee details"
          ></div>
          <p className="mt-4 text-ink-soft">Loading employee details&hellip;</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <p className="mb-4 text-stamp-red-ink">
            {error || "Employee not found"}
          </p>
          <Link
            to="/employees"
            className="text-ink underline hover:text-ink/80"
          >
            Back to Employees
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
            to="/employees"
            className="mb-4 inline-flex items-center text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Staff
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserGroupIcon className="h-8 w-8 flex-shrink-0 text-ink" />
              <div>
                <h1 className="text-2xl font-bold text-ink">
                  Employee Details
                </h1>
                <p className="font-mono text-xs tracking-wide text-ink-soft">
                  NO. {uuid?.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.employeeEdit(uuid!)}
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
              {employee.person_name}
            </span>
            <StatusStamp label="On File" tone="verified" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field label="Full Name" value={employee.person_name} />
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Role
              </h3>
              <span
                className="badge-tag"
                style={{ background: roleMeta(employee.role).color }}
              >
                {roleMeta(employee.role).abbr} · {employee.role}
              </span>
            </div>
            <Field label="Email" value={employee.person_email || "N/A"} />
            <Field label="Phone" value={employee.person_phone || "N/A"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
