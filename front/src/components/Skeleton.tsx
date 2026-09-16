import React from "react";

interface SkeletonCardsProps {
  count?: number;
  /** Tailwind grid-cols-* classes matching the real grid this replaces. */
  columns?: string;
}

/**
 * Layout-matching placeholder for a card grid while its data loads.
 * Replaces a bare "Loading..." line so the page doesn't collapse to a
 * fraction of its final height and then jump (CLS) once data arrives.
 */
export const SkeletonCards: React.FC<SkeletonCardsProps> = ({
  count = 6,
  columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
}) => (
  <div
    className={`grid ${columns} gap-6`}
    role="status"
    aria-live="polite"
    aria-label="Loading records"
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        aria-hidden="true"
        className="animate-pulse rounded-xl border border-ink/10 bg-paper p-6 shadow-[0_2px_12px_-4px_rgba(14,61,57,0.12)]"
      >
        <div className="mb-4 h-5 w-2/3 rounded bg-ink/10" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-ink/10" />
          <div className="h-4 w-5/6 rounded bg-ink/10" />
          <div className="h-4 w-2/3 rounded bg-ink/10" />
        </div>
      </div>
    ))}
  </div>
);

interface SkeletonTableRowsProps {
  rows?: number;
  columns: number;
}

/** Layout-matching placeholder `<tr>` rows for a data table while it loads. */
export const SkeletonTableRows: React.FC<SkeletonTableRowsProps> = ({
  rows = 8,
  columns,
}) => (
  <>
    <tr className="sr-only" role="status" aria-live="polite">
      <td>Loading records</td>
    </tr>
    {Array.from({ length: rows }).map((_, r) => (
      <tr key={r} className="animate-pulse" aria-hidden="true">
        {Array.from({ length: columns }).map((_, c) => (
          <td key={c} className="px-6 py-4">
            <div className="h-4 w-full rounded bg-ink/10" />
          </td>
        ))}
      </tr>
    ))}
  </>
);
