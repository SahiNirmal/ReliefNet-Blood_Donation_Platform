import StatusBadge from "./StatusBadge";

// Shown when a donor clicks "Respond": lets them review the requester's
// details before committing, since confirming shares the donor's own
// contact details with that requester.
export default function RespondModal({ request, onConfirm, onCancel, confirming }) {
  if (!request) return null;

 // The name shown here is always the actual account holder — a request
// is posted by a person (they registered with a name/email/phone),
// never by an organization itself. If they gave an organization, it's
// shown as context alongside their name, not in place of it.
const requesterName = request.requester?.name || "Requester";
const requesterOrg = request.requester?.organization;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-action-navy/50 dark:bg-black/75 p-4 backdrop-blur-sm">
      <div role="dialog" aria-labelledby="respond-title" className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-surface p-5 shadow-xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow font-mono text-xs uppercase tracking-wider text-crimson">
              Respond to request
            </p>
            <h2 id="respond-title" className="font-display mt-1 text-xl font-semibold">{request.patientName}</h2>
          </div>
          <StatusBadge status={request.urgency} />
        </div>

        <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
          <Row label="Blood group needed" value={request.bloodGroup} />
          <Row label="Units needed" value={request.unitsNeeded} />
          <Row label="Hospital" value={request.hospital} />
          <Row
            label="Requested by"
           value={requesterOrg ? `${requesterName} · ${requesterOrg}` : requesterName}
          />
          <Row label="Requester contact" value={request.contactNumber} />
          {typeof request.distanceKm === "number" && (
            <Row label="Distance from you" value={`${request.distanceKm.toFixed(1)} km`} />
          )}
        </dl>

        <p className="mt-5 rounded-lg bg-bg-alt px-3 py-2.5 text-xs text-ink-soft">
          Confirming will share your name, phone number, email, and blood
          group with this requester so you can coordinate directly. This
          does not mark the request as fulfilled — only the requester can
          do that once they've actually received the blood.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 rounded-full bg-action py-2.5 text-sm font-medium text-white transition-colors hover:bg-action-hover disabled:opacity-60"
          >
            {confirming ? "Confirming…" : "Confirm & Respond"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="max-w-[60%] break-words text-right font-medium">{value}</dd>
    </div>
  );
}
