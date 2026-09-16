import React from "react";
import { Link } from "react-router-dom";
import {
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ROUTES } from "../config/api";
import { roleMeta } from "../utils/roleMeta";

export interface Schedule {
  person_uuid: string;
  essn: number;
  fid: number;
  date: string;
  start_time: string;
  end_time: string;
  employee_name: string;
  facility_name: string;
  employee_role: string;
}

interface ScheduleCardProps {
  schedule: Schedule;
  /** Whether Edit/Delete controls render - true when a user is logged in. */
  canWrite: boolean;
  onDeleteClick: (schedule: Schedule) => void;
}

const Field: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-baseline gap-2 text-sm">
    <Icon className="h-3.5 w-3.5 flex-shrink-0 translate-y-0.5 text-ink-soft" />
    <span className="w-16 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {label}
    </span>
    <span className="truncate text-ink">{value}</span>
  </div>
);

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  canWrite,
  onDeleteClick,
}) => {
  const { abbr, color } = roleMeta(schedule.employee_role);
  return (
    // A schedule shift as a badge object: bordered, rounded, punch-hole
    // notch via .badge-card - the same object language every other entity
    // uses now, not a bespoke shadow card.
    <div className="badge-card p-5">
      {/* Name and role stack vertically rather than sharing a row - a long
        role label ("Administrative Personnel") fighting the name for one
        row was wrapping awkwardly and making card heights inconsistent
        row to row (same bug already fixed on EmployeeCard). */}
      <div className="mb-3 flex items-start justify-between gap-2 border-b border-paper-line pb-3">
        <div className="min-w-0 truncate text-base font-bold text-ink">
          {schedule.employee_name}
        </div>
        <span className="badge-tag flex-none" style={{ background: color }}>
          {abbr}
        </span>
      </div>

      <div className="space-y-1.5">
        <Field
          icon={BuildingOfficeIcon}
          label="Facility"
          value={schedule.facility_name}
        />
        <Field
          icon={CalendarIcon}
          label="Date"
          value={new Date(schedule.date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        />
        <Field
          icon={ClockIcon}
          label="Shift"
          value={`${schedule.start_time.slice(0, 5)} → ${
            schedule.end_time ? schedule.end_time.slice(0, 5) : "Ongoing"
          }`}
        />
      </div>

      <div className="mt-4 flex gap-2 border-t border-paper-line pt-4">
        <Link
          to={ROUTES.scheduleDetail(
            schedule.person_uuid,
            schedule.fid,
            schedule.date,
            schedule.start_time,
          )}
          className="flex flex-1 items-center justify-center gap-1.5 rounded border border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          <EyeIcon className="h-3.5 w-3.5" />
          Details
        </Link>
        {canWrite && (
          <>
            <Link
              to={ROUTES.scheduleEdit(
                schedule.person_uuid,
                schedule.fid,
                schedule.date,
                schedule.start_time,
              )}
              className="flex flex-1 items-center justify-center gap-1.5 rounded border border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              <PencilIcon className="h-3.5 w-3.5" />
              Edit
            </Link>
            <button
              onClick={() => onDeleteClick(schedule)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded border border-stamp-red px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-stamp-red-ink transition-colors hover:bg-stamp-red hover:text-paper"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Same memo rationale as PersonCard - canWrite is a plain boolean and
// onDeleteClick is stabilized with useCallback in ScheduleList.
export default React.memo(ScheduleCard);
