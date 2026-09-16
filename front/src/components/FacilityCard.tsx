import React from "react";
import { Link } from "react-router-dom";
import {
  PhoneIcon,
  MapPinIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export interface Facility {
  fid: number;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone_number: string;
  web_address: string;
  type: string;
  capacity: number;
  gmssn: number;
  general_manager_name: string;
}

/** Facility type -> badge color. No dedicated theme slot for this axis, so
 * reusing the role palette where a thematic fit exists (pharmacist violet
 * for Pharmacy) and spreading the rest across the remaining role colors. */
const TYPE_COLORS: Record<string, string> = {
  Hospital: "var(--color-role-doctor)",
  CLSC: "var(--color-role-nurse)",
  Clinic: "var(--color-verified-green)",
  Pharmacy: "var(--color-role-pharmacist)",
  "Special installment": "var(--color-role-security)",
};

const Field: React.FC<{
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-baseline gap-2 text-sm">
    <Icon className="h-3.5 w-3.5 flex-shrink-0 translate-y-0.5 text-ink-soft" />
    <span className="w-20 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {label}
    </span>
    <span className="truncate text-ink">{value}</span>
  </div>
);

interface FacilityCardProps {
  facility: Facility;
  /** Whether Edit/Delete controls render - true when a user is logged in. */
  canWrite: boolean;
  onDeleteClick: (facility: Facility) => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  canWrite,
  onDeleteClick,
}) => (
  // A facility record as a badge object: bordered, rounded, punch-hole
  // notch via .badge-card, same pattern as PersonCard/EmployeeCard. No
  // per-record occupancy here - the facilities list endpoint doesn't
  // return it (Dashboard's "Top Facilities" table is the real source for
  // that), so this card doesn't fabricate one.
  <div className="badge-card p-5">
    <div className="mb-3 flex items-start justify-between gap-2 border-b border-paper-line pb-3">
      <div className="min-w-0">
        <div className="truncate text-base font-bold text-ink">
          {facility.name}
        </div>
        <div className="mt-0.5 font-mono text-[10px] tracking-wide text-ink-soft">
          FID {facility.fid}
        </div>
      </div>
      <span
        className="badge-tag flex-none"
        style={{
          background: TYPE_COLORS[facility.type] ?? "var(--color-ink-soft)",
        }}
      >
        {facility.type}
      </span>
    </div>

    <div className="space-y-1.5">
      <Field
        icon={MapPinIcon}
        label="Address"
        value={`${facility.address}, ${facility.city}, ${facility.province} ${facility.postal_code}`}
      />
      <Field icon={PhoneIcon} label="Phone" value={facility.phone_number} />
      {facility.capacity != null && (
        <Field
          icon={BuildingOfficeIcon}
          label="Capacity"
          value={`${facility.capacity} beds`}
        />
      )}
      <Field
        icon={UserCircleIcon}
        label="Manager"
        value={facility.general_manager_name}
      />
    </div>

    <div className="mt-4 flex gap-2 border-t border-paper-line pt-4">
      <Link
        to={`/facilities/${facility.fid}`}
        className="flex flex-1 items-center justify-center gap-1.5 rounded border border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        <EyeIcon className="h-3.5 w-3.5" />
        Details
      </Link>
      {canWrite && (
        <>
          <Link
            to={`/facilities/${facility.fid}/edit`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <PencilIcon className="h-3.5 w-3.5" />
            Edit
          </Link>
          <button
            onClick={() => onDeleteClick(facility)}
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

export default React.memo(FacilityCard);
