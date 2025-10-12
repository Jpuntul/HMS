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
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
          <div>
            <span className="text-blue-900 font-medium">
              {totalResults} result{totalResults !== 1 ? "s" : ""} found
            </span>
            {searchTerm && (
              <span className="text-blue-700"> for "{searchTerm}"</span>
            )}
            {filterCount > 0 && (
              <span className="text-blue-700">
                {" "}
                with {filterCount} filter{filterCount !== 1 ? "s" : ""} applied
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded border border-blue-300 hover:bg-blue-100 transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  );
};

export default SearchResultsHeader;
