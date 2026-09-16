import React, { useEffect, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDebounce } from "../hooks/useDebounce";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  /** Quiet period before a keystroke reaches the parent. Default 500ms. */
  debounceMs?: number;
  /** Stable id so the label is programmatically associated with the input. */
  id?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  label,
  className = "",
  debounceMs = 500,
  id,
}) => {
  // Falls back to a slug of the label rather than one fixed id, so two
  // SearchBars on the same page (unlikely today, but not impossible)
  // don't collide - only an explicit `id` prop is a hard guarantee.
  const inputId =
    id ?? `search-${(label ?? "bar").toLowerCase().replace(/\s+/g, "-")}`;
  // Typing updates only this local state, so a keystroke re-renders this
  // input, not the parent (and everything the parent re-renders, e.g. a
  // whole card grid). onSearchChange - which parents use to trigger a fetch
  // - only fires once typing settles, matching what parents previously got
  // from their own now-removed `useDebounce(searchTerm, 500)`.
  const [localValue, setLocalValue] = useState(searchTerm);
  const debouncedValue = useDebounce(localValue, debounceMs);

  // Stay in sync if the parent resets searchTerm from outside (e.g. a
  // "clear filters" action), without fighting the user's own typing.
  useEffect(() => {
    setLocalValue(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedValue !== searchTerm) {
      onSearchChange(debouncedValue);
    }
    // Only the settled value should trigger this - onSearchChange/searchTerm
    // intentionally excluded so a parent-side setSearchTerm doesn't re-fire it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleClear = () => {
    setLocalValue("");
    onSearchChange("");
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-soft"
        >
          <MagnifyingGlassIcon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </label>
      )}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-4 w-4 text-ink-soft" />
        </div>
        <input
          id={inputId}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-paper-line bg-paper py-2 pl-9 pr-9 text-sm text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
        {localValue && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              onClick={handleClear}
              className="text-ink-soft hover:text-ink focus:outline-none"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
