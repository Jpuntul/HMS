import React from "react";

export type StampTone = "urgent" | "verified" | "pending";

const TONE_STYLES: Record<StampTone, string> = {
  urgent: "bg-stamp-red",
  verified: "bg-verified-green",
  pending: "bg-pending-amber",
};

interface StatusStampProps {
  label: string;
  tone: StampTone;
  className?: string;
}

/**
 * The recurring status motif from the Access & Roster direction: a solid
 * reversed-color tag (see `.badge-tag` in index.css) - never a tinted
 * pastel pill or a colored stripe, both banned generic patterns for this
 * system. Reserved for states that are actually true - never a decorative
 * accent (see direction contract, OWN-WORLD block).
 */
const StatusStamp: React.FC<StatusStampProps> = ({
  label,
  tone,
  className = "",
}) => (
  <span className={`badge-tag ${TONE_STYLES[tone]} ${className}`}>{label}</span>
);

export default StatusStamp;
