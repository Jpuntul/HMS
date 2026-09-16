import React from "react";

interface FormCheckProps {
  /** True renders a filled, checked box; false an empty ruled box. */
  checked?: boolean;
  className?: string;
}

/**
 * The recurring "verified" motif: a real square form checkbox, not a
 * checkmark icon standing in for one. Static/decorative in most uses here
 * (a record's confirmed state), matching the direction contract's
 * signature interaction.
 */
const FormCheck: React.FC<FormCheckProps> = ({
  checked = true,
  className = "",
}) => (
  <span
    className={`inline-flex h-4 w-4 flex-shrink-0 items-center justify-center border-2 ${
      checked ? "border-ink bg-ink" : "border-paper-line bg-transparent"
    } ${className}`}
    aria-hidden="true"
  >
    {checked && (
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
        <path
          d="M3.5 8.5L6.5 11.5L12.5 4.5"
          stroke="var(--color-paper)"
          strokeWidth="2"
          strokeLinecap="square"
        />
      </svg>
    )}
  </span>
);

export default FormCheck;
