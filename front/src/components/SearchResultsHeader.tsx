import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchResultsHeaderProps {
  totalResults: number;
  searchTerm?: string;
  filterCount: number;
  onClearFilters: () => void;
}

const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  totalResults,
  searchTerm,
  filterCount,
  onClearFilters,
}) => {
  if (!searchTerm && filterCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MagnifyingGlassIcon className="h-4 w-4 text-ink-soft" />
        <div className="text-sm">
          <span className="font-medium text-ink">
            {totalResults} result{totalResults !== 1 ? "s" : ""} found
          </span>
          {searchTerm && (
            <span className="text-ink-soft"> for "{searchTerm}"</span>
          )}
          {filterCount > 0 && (
            <span className="text-ink-soft">
              {" "}
              with {filterCount} filter{filterCount !== 1 ? "s" : ""} applied
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onClearFilters}
        className="rounded-lg border border-ink px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        Clear all
      </button>
    </div>
  );
};

export default SearchResultsHeader;
