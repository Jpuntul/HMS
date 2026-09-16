import React from "react";
import { Link } from "react-router-dom";
import {
  EnvelopeIcon,
  PhoneIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { ROUTES } from "../config/api";
import { roleMeta } from "../utils/roleMeta";

export interface Employee {
  uuid: string;
  ssn: number;
  role: string;
  person_name: string;
  person_email: string;
  person_phone: string;
}

const Field: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-baseline gap-2 text-sm">
    <Icon className="h-3.5 w-3.5 flex-shrink-0 translate-y-0.5 text-ink-soft" />
    <span className="w-14 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {label}
    </span>
    <span className="truncate text-ink">{value}</span>
  </div>
);

interface EmployeeCardProps {
  employee: Employee;
  /** Whether Edit/Delete controls render - true when a user is logged in. */
  canWrite: boolean;
  onDeleteClick: (employee: Employee) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  canWrite,
  onDeleteClick,
}) => {
  const { abbr, color } = roleMeta(employee.role);

  return (
    // A staff record as a badge object: bordered, rounded, punch-hole notch
    // via .badge-card. Name stacks above the role tag (not sharing a row)
    // so a long role label never truncates the name - the pre-existing bug
    // this replacement fixes. The public uuid (never SSN) formats into a
    // short badge ID line, same pattern as PersonCard.
    <div className="badge-card p-5">
      <div className="mb-3 flex items-start justify-between gap-2 border-b border-paper-line pb-3">
        <div className="min-w-0">
          <div className="truncate text-base font-bold text-ink">
            {employee.person_name}
          </div>
          <div className="mt-0.5 font-mono text-[10px] tracking-wide text-ink-soft">
            NO. {employee.uuid.slice(0, 8).toUpperCase()}
          </div>
        </div>
        <span className="badge-tag flex-none" style={{ background: color }}>
          {abbr}
        </span>
      </div>

      <div className="space-y-1.5">
        {employee.person_email && (
          <Field
            icon={EnvelopeIcon}
            label="Email"
            value={employee.person_email}
          />
        )}
        {employee.person_phone && (
          <Field icon={PhoneIcon} label="Phone" value={employee.person_phone} />
        )}
      </div>

      <div className="mt-4 flex gap-2 border-t border-paper-line pt-4">
        <Link
          to={ROUTES.employeeDetail(employee.uuid)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded border border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          <EyeIcon className="h-3.5 w-3.5" />
          Details
        </Link>
        {canWrite && (
          <>
            <Link
              to={ROUTES.employeeEdit(employee.uuid)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded border border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              <PencilIcon className="h-3.5 w-3.5" />
              Edit
            </Link>
            <button
              onClick={() => onDeleteClick(employee)}
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

export default React.memo(EmployeeCard);
