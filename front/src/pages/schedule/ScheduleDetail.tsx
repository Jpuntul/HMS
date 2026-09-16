import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS, ROUTES } from "../../config/api";
import {
  CalendarIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import FormCheck from "../../components/FormCheck";
import { roleMeta } from "../../utils/roleMeta";

interface ScheduleData {
  essn: number;
  fid: number;
  date: string;
  start_time: string;
  end_time: string | null;
  employee_name: string;
  facility_name: string;
  employee_role: string;
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {label}
    </h4>
    <div className="text-base text-ink">{children}</div>
  </div>
);

const Section: React.FC<{
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="border-b border-paper-line px-6 py-6 last:border-b-0">
    <h3 className="mb-4 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-ink">
      {Icon && <Icon className="h-4 w-4 text-ink-soft" />}
      {title}
    </h3>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{children}</div>
  </div>
);

const ScheduleDetail: React.FC = () => {
  const { person_uuid, fid, date, start_time } = useParams<{
    person_uuid: string;
    fid: string;
    date: string;
    start_time: string;
  }>();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!person_uuid || !fid || !date || !start_time) {
        navigate("/schedules");
        return;
      }

      try {
        const response = await axios.get(
          API_ENDPOINTS.scheduleDetail(person_uuid, fid, date, start_time),
        );
        setSchedule(response.data);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setError("Failed to load schedule details");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [person_uuid, fid, date, start_time, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return "Open-ended";

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
            role="status"
            aria-label="Loading schedule details"
          ></div>
          <p className="mt-4 text-sm text-ink-soft">
            Loading schedule details…
          </p>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="text-center">
          <p className="mb-4 text-stamp-red-ink">
            {error || "Schedule not found"}
          </p>
          <Link
            to="/schedules"
            className="text-ink underline hover:no-underline"
          >
            Back to Schedules
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
            to="/schedules"
            className="mb-4 inline-flex items-center text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Schedules
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-ink" />
              <div>
                <h1 className="text-2xl font-bold text-ink">
                  Work Schedule Details
                </h1>
                <p className="font-mono text-xs tracking-wide text-ink-soft">
                  NO. {person_uuid?.slice(0, 8).toUpperCase()} ·{" "}
                  {schedule.facility_name} · {formatDate(schedule.date)} at{" "}
                  {schedule.start_time.slice(0, 5)}
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.scheduleEdit(person_uuid!, fid!, date!, start_time!)}
              className="flex flex-none items-center gap-2 whitespace-nowrap rounded border-[1.5px] border-ink bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-ink/90"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>

        {/* Details Panel */}
        <div className="badge-card">
          <Section title="Employee Information">
            <Field label="Employee Name">{schedule.employee_name}</Field>
            <Field label="Role">
              <span
                className="badge-tag"
                style={{ background: roleMeta(schedule.employee_role).color }}
              >
                {roleMeta(schedule.employee_role).abbr}
              </span>
            </Field>
          </Section>

          <Section title="Schedule Information">
            <Field label="Facility">{schedule.facility_name}</Field>
            <Field label="Work Date">{formatDate(schedule.date)}</Field>
          </Section>

          <Section title="Shift Details" icon={ClockIcon}>
            <Field label="Start Time">
              <span className="font-semibold tabular-nums">
                {formatTime(schedule.start_time)}
              </span>
            </Field>
            <Field label="End Time">
              <span className="font-semibold tabular-nums">
                {schedule.end_time
                  ? formatTime(schedule.end_time)
                  : "Open-ended"}
              </span>
            </Field>
            <Field label="Duration">
              <span className="font-semibold tabular-nums">
                {calculateDuration(schedule.start_time, schedule.end_time)}
              </span>
            </Field>
          </Section>

          {/* Summary */}
          <div className="px-6 py-6">
            <div className="flex items-start gap-3 rounded border border-paper-line bg-ink/[0.03] p-4">
              <FormCheck className="mt-0.5" />
              <p className="text-sm text-ink-soft">
                <strong className="text-ink">Schedule Summary:</strong>{" "}
                {schedule.employee_name} ({schedule.employee_role}) is scheduled
                to work at {schedule.facility_name} on{" "}
                {formatDate(schedule.date)} from{" "}
                {formatTime(schedule.start_time)} to{" "}
                {schedule.end_time
                  ? formatTime(schedule.end_time)
                  : "end of day"}
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetail;
