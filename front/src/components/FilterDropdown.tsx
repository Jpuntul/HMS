import React from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import Dropdown from "./Dropdown";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
  /** Stable id so the label is programmatically associated with the control. */
  id?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  className = "",
  id,
}) => {
  // Falls back to a slug of the label rather than one fixed id, so two
  // FilterDropdowns on the same page don't collide - only an explicit `id`
  // prop is a hard guarantee.
  const selectId = id ?? `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;

  // "All X" is a real, selectable option (value ""), not just placeholder
  // text - otherwise there'd be no way to clear the filter once set.
  const dropdownOptions = [
    { value: "", label: `All ${label}` },
    ...options.map((option) => ({
      value: option.value,
      label:
        option.count !== undefined
          ? `${option.label} (${option.count})`
          : option.label,
    })),
  ];

  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={selectId}
        className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-soft"
      >
        <FunnelIcon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </label>
      <Dropdown
        id={selectId}
        value={value}
        onChange={onChange}
        options={dropdownOptions}
        placeholder={`All ${label}`}
      />
    </div>
  );
};

export default FilterDropdown;
