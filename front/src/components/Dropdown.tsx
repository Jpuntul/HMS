import React, { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Custom listbox replacing the native <select>. A native select's own
 * popup can't be restyled - it always renders in the OS's default chrome,
 * which breaks the design system everywhere it appears. Full ARIA listbox
 * pattern: button + popup, arrow-key navigation, Enter/Space to choose,
 * Escape and outside-click to dismiss - same interaction contract as
 * NavDropdown, applied to form/filter selects instead of nav menus.
 */
const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  id,
  className = "",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      setActiveIndex(options.findIndex((o) => o.value === value));
    }
  }, [open, options, value]);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      listRef.current
        ?.querySelector(`[data-index="${activeIndex}"]`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex]);

  const commit = (index: number) => {
    const opt = options[index];
    if (opt) onChange(opt.value);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (activeIndex >= 0) commit(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-paper-line bg-paper py-2 pl-3 pr-2.5 text-sm text-ink transition-colors focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selected ? "text-ink" : "text-ink-soft/70"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 flex-shrink-0 text-ink-soft transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-lg border border-ink/10 bg-paper py-1 shadow-[0_12px_32px_-8px_rgba(14,61,57,0.3)] focus:outline-none"
        >
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-ink-soft">No options</li>
          )}
          {options.map((opt, index) => (
            <li
              key={opt.value}
              data-index={index}
              role="option"
              aria-selected={opt.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commit(index)}
              className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors ${
                index === activeIndex
                  ? "bg-ink/[0.06] text-ink"
                  : "text-ink-soft"
              }`}
            >
              <span>{opt.label}</span>
              {opt.value === value && (
                <CheckIcon className="h-4 w-4 text-verified-green-ink" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
