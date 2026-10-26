import StatusBadge from "./StatusBadge";

export default function RequestCard({ request, hideActions = false }) {
  const { patientName, bloodGroup, unitsNeeded, hospital, urgency, postedAgo, contact } = request;

  return (
    <article className="request-card panel flex min-w-0 flex-col gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crimson-tint font-mono text-sm font-semibold text-crimson-dark">
            {bloodGroup}
          </div>
          <div className="min-w-0 break-words">
            <h3 className="font-display text-lg font-semibold leading-tight">{patientName}</h3>
            <p className="text-xs text-ink-soft">{hospital}</p>
          </div>
        </div>
        <StatusBadge status={urgency} />
      </div>

      <dl className="grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
        <div>
          <dt className="text-xs text-ink-soft">Units needed</dt>
          <dd className="mt-1 break-words font-mono font-medium">{unitsNeeded}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-soft">Posted</dt>
          <dd className="mt-1 break-words font-mono font-medium">{postedAgo}</dd>
        </div>
        <div className="col-span-2 break-words">
          <dt className="text-xs text-ink-soft">Contact</dt>
          <dd className="font-medium">{contact}</dd>
        </div>
      </dl>

      {!hideActions && (
        <button className="mt-auto w-full rounded-full bg-action-neutral py-2.5 text-sm font-medium text-white transition-colors hover:bg-action">
          Respond to this request
        </button>
      )}
    </article>
  );
}
