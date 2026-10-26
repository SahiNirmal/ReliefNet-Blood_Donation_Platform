const STYLES = {
  critical: "bg-crimson-tint text-crimson-dark border-crimson/30",
  urgent: "bg-amber-tint text-amber-dark border-amber/30",
  stable: "bg-green-tint text-green border-green/30",
  completed: "bg-green-tint text-green border-green/30",
  available: "bg-green-tint text-green border-green/30",
  unavailable: "bg-bg-alt text-ink-soft border-line",
  open: "bg-navy-tint text-navy border-navy/30",
  fulfilled: "bg-green-tint text-green border-green/30",
  scheduled: "bg-amber-tint text-amber-dark border-amber/30",
  cancelled: "bg-bg-alt text-ink-soft border-line",
};

const LABELS = {
  critical: "Critical",
  urgent: "Urgent",
  stable: "Stable",
  completed: "Completed",
  available: "Available",
  unavailable: "Unavailable",
  open: "Open",
  fulfilled: "Fulfilled",
  scheduled: "Pending pickup",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium font-mono ${
        STYLES[status] || STYLES.unavailable
      }`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status] || status}
    </span>
  );
}
