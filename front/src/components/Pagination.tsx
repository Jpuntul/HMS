import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  itemsPerPage = 20,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="mt-6 flex items-center justify-between rounded-xl border border-ink/10 bg-paper px-4 py-3 shadow-[0_2px_12px_-4px_rgba(14,61,57,0.12)] sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        {/* Mobile view */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            currentPage === 1
              ? "cursor-not-allowed border-paper-line bg-ink/[0.03] text-ink-soft/50"
              : "border-paper-line bg-paper text-ink hover:bg-ink/[0.04]"
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? "cursor-not-allowed border-paper-line bg-ink/[0.03] text-ink-soft/50"
              : "border-paper-line bg-paper text-ink hover:bg-ink/[0.04]"
          }`}
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink-soft">
            Showing <span className="font-medium text-ink">{startItem}</span> to{" "}
            <span className="font-medium text-ink">{endItem}</span> of{" "}
            <span className="font-medium text-ink">{totalCount}</span> results
          </p>
        </div>
        <div>
          <nav
            className="inline-flex -space-x-px rounded-lg"
            aria-label="Pagination"
          >
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-lg border px-2 py-2 text-sm font-medium transition-colors ${
                currentPage === 1
                  ? "cursor-not-allowed border-paper-line bg-ink/[0.03] text-ink-soft/40"
                  : "border-paper-line bg-paper text-ink-soft hover:bg-ink/[0.04]"
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center border border-paper-line bg-paper px-4 py-2 text-sm font-medium text-ink-soft"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "z-10 border-ink bg-ink text-paper"
                      : "border-paper-line bg-paper text-ink-soft hover:bg-ink/[0.04]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-lg border px-2 py-2 text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "cursor-not-allowed border-paper-line bg-ink/[0.03] text-ink-soft/40"
                  : "border-paper-line bg-paper text-ink-soft hover:bg-ink/[0.04]"
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
