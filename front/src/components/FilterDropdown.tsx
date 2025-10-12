import React from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";

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
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <div className="flex items-center space-x-1">
          <FunnelIcon className="h-4 w-4" />
          <span>{label}</span>
        </div>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        <option value="">All {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} {option.count !== undefined && `(${option.count})`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
