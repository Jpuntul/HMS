import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import {
  CalendarIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

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

const ScheduleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!id) {
        navigate("/schedules");
        return;
      }

      try {
        const response = await axios.get(`${API_ENDPOINTS.schedules}${id}/`);
        setSchedule(response.data);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setError("Failed to load schedule details");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [id, navigate]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule details...</p>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Schedule not found"}</p>
          <Link to="/schedules" className="text-blue-600 hover:text-blue-700">
            Back to Schedules
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
            to="/schedules"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Schedules
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Work Schedule Details
                </h1>
                <p className="text-gray-500">Schedule ID: {id}</p>
              </div>
            </div>
            <Link
              to={`/schedules/${id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PencilSquareIcon className="h-5 w-5 mr-2" />
              Edit
            </Link>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Employee Information */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Employee Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Employee Name
                </h4>
                <p className="text-lg text-gray-900">
                  {schedule.employee_name}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Role
                </h4>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {schedule.employee_role}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Employee SSN
                </h4>
                <p className="text-lg text-gray-900">{schedule.essn}</p>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Schedule Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Facility
                </h4>
                <p className="text-lg text-gray-900">
                  {schedule.facility_name}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Work Date
                </h4>
                <p className="text-lg text-gray-900">
                  {formatDate(schedule.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Time Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
              Shift Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Start Time
                </h4>
                <p className="text-lg text-gray-900 font-semibold">
                  {formatTime(schedule.start_time)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  End Time
                </h4>
                <p className="text-lg text-gray-900 font-semibold">
                  {schedule.end_time
                    ? formatTime(schedule.end_time)
                    : "Open-ended"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Duration
                </h4>
                <p className="text-lg text-gray-900 font-semibold">
                  {calculateDuration(schedule.start_time, schedule.end_time)}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 pt-6 border-t">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Schedule Summary:</strong> {schedule.employee_name} (
                {schedule.employee_role}) is scheduled to work at{" "}
                {schedule.facility_name} on {formatDate(schedule.date)} from{" "}
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
