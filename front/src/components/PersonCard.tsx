import React from "react";
import { Link } from "react-router-dom";
import {
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { ROUTES } from "../config/api";
import type { Person } from "../pages/person/PersonList";

interface PersonCardProps {
  person: Person;
  /** Whether Edit/Delete controls render - true when a user is logged in. */
  canWrite: boolean;
  onDeleteClick: (person: Person) => void;
}

const Field: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-baseline gap-2 text-sm">
    <Icon className="h-3.5 w-3.5 flex-shrink-0 translate-y-0.5 text-ink-soft" />
    <span className="w-20 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {label}
    </span>
    <span className="truncate text-ink">{value}</span>
  </div>
);

const PersonCard: React.FC<PersonCardProps> = ({
  person,
  canWrite,
  onDeleteClick,
}) => (
  // A person record as a badge object: bordered, rounded, punch-hole notch
  // via .badge-card. The public uuid (never SSN/Medicare) formats into a
  // short badge ID line - real data, not a fabricated sequence.
  <div className="badge-card p-5">
    <div className="mb-3 flex items-start justify-between gap-2 border-b border-paper-line pb-3">
      <div>
        <div className="text-base font-bold text-ink">
          {person.first_name} {person.last_name}
        </div>
        <div className="mt-0.5 font-mono text-[10px] tracking-wide text-ink-soft">
          NO. {person.uuid.slice(0, 8).toUpperCase()}
        </div>
      </div>
      <span
        className="badge-tag flex-none"
        style={{ background: "var(--color-verified-green)" }}
      >
        ON FILE
      </span>
    </div>

    <div className="space-y-1.5">
      <Field icon={CalendarDaysIcon} label="DOB" value={person.dob} />
      {person.email && (
        <Field icon={EnvelopeIcon} label="Email" value={person.email} />
      )}
      {person.telephone && (
        <Field icon={PhoneIcon} label="Phone" value={person.telephone} />
      )}
      {person.occupation && (
        <Field
          icon={BriefcaseIcon}
          label="Occupation"
          value={person.occupation}
        />
      )}
    </div>

    <div className="mt-4 flex gap-2 border-t border-paper-line pt-4">
      <Link
        to={ROUTES.personDetail(person.uuid)}
        className="flex flex-1 items-center justify-center gap-1.5 rounded border border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        <EyeIcon className="h-3.5 w-3.5" />
        Details
      </Link>
      {canWrite && (
        <>
          <Link
            to={ROUTES.personEdit(person.uuid)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <PencilIcon className="h-3.5 w-3.5" />
            Edit
          </Link>
          <button
            onClick={() => onDeleteClick(person)}
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

// canWrite is a plain boolean and onDeleteClick is stabilized with useCallback
// in PersonList, so a shallow-equal skip here actually fires: unrelated state
// changes (page, other filters) no longer re-render every card, only the ones
// whose own `person` object reference changed.
export default React.memo(PersonCard);
