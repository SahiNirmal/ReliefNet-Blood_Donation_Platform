import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import StatusBadge from "../components/StatusBadge";
import RequestCard from "../components/RequestCard";
import ChatModal from "../components/ChatModal";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { fetchRequests, updateRequestStatus } from "../store/requestsSlice";
import { getSocket } from "../socket/socketClient";

export default function RequesterDashboard() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [ownRequests, setOwnRequests] = useState(null);
  const [ownLoading, setOwnLoading] = useState(true);
  const loadOwnRequests = useCallback(() => {
    if (!user?._id) return;
    setOwnLoading(true);
    api
      .get(`/requests?requesterId=${user._id}`)
      .then(setOwnRequests)
      .finally(() => setOwnLoading(false));
  }, [user?._id]);
  useEffect(() => {
    loadOwnRequests();
  }, [loadOwnRequests]);

  const { items: allRequests, status } = useSelector((s) => s.requests);
  useEffect(() => {
    dispatch(fetchRequests({ status: "open" }));
  }, [dispatch]);
  const othersRequests = allRequests.filter((r) => r.requester?._id !== user?._id).slice(0, 3);

  return (
    <div className="page-shell mx-auto max-w-6xl px-5 py-8 sm:py-12 lg:py-14">
      <p className="eyebrow font-mono text-xs uppercase tracking-wider text-crimson">
        Requester dashboard
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Welcome, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <Link
          to="/request-blood"
          className="rounded-full bg-action px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-action-hover"
        >
          + Post a new request
        </Link>
      </div>

      <section className="mt-8 panel rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight">Your requests</h2>
          <span className="font-mono break-words text-xs text-ink-soft">
            {ownLoading ? "Loading…" : `${ownRequests?.length ?? 0} total`}
          </span>
        </div>

        {ownLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-bg-alt" />
            ))}
          </div>
        ) : !ownRequests || ownRequests.length === 0 ? (
          <div className="empty-state rounded-xl border border-dashed border-line px-5 py-12 text-center text-sm text-ink-soft">
            You haven't posted any requests yet.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {ownRequests.map((r) => (
              <RequestRow key={r._id} request={r} onStatusChanged={loadOwnRequests} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight">Other active requests on the platform</h2>
          <Link to="/requests" className="text-sm font-medium text-crimson hover:text-crimson-dark">
            View all →
          </Link>
        </div>
        {status === "loading" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-bg-alt" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {othersRequests.length === 0 && (
              <p className="empty-state col-span-full rounded-2xl px-5 py-10 text-center text-sm text-ink-soft">
                No other active requests to display right now.
              </p>
            )}
            {othersRequests.map((r) => (
              <RequestCard
                key={r._id}
                request={{
                  id: r._id,
                  patientName: r.patientName,
                  bloodGroup: r.bloodGroup,
                  unitsNeeded: r.unitsNeeded,
                  hospital: r.hospital,
                  urgency: r.urgency,
                  postedAgo: new Date(r.createdAt).toLocaleDateString(),
                  contact: r.requester?.organization
                    ? `${r.requester?.name || "Requester"} · ${r.requester.organization}`
                    : r.requester?.name || "Requester",
                }}
                hideActions
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// One request row: shows its own status, an expandable list of donors
// who've responded (with contact details), chat actions, and status controls.
function RequestRow({ request, onStatusChanged }) {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [responses, setResponses] = useState(null);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [hasLiveUpdate, setHasLiveUpdate] = useState(false);
  const [activeChatDonation, setActiveChatDonation] = useState(null);

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    setHasLiveUpdate(false);
    if (next && responses === null) {
      setResponsesLoading(true);
      api
        .get(`/donations?requestId=${request._id}`)
        .then(setResponses)
        .finally(() => setResponsesLoading(false));
    }
  }

  // Experiment 8: a donor responding to THIS request arrives live over
  // the shared WebSocket connection (set up once in useSocket/App.jsx).
  // Updates the response list in place — no refetch needed — and flags
  // a small indicator if the row is currently collapsed so it isn't missed.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleNewResponse(donation) {
      const donationRequestId = donation.request?._id || donation.request;
      if (donationRequestId !== request._id) return;

      setResponses((prev) => {
        if (prev === null) return [donation];
        const exists = prev.some((r) => r._id === donation._id);
        return exists ? prev : [donation, ...prev];
      });

      if (!expanded) setHasLiveUpdate(true);
    }

    socket.on("new-response", handleNewResponse);
    return () => socket.off("new-response", handleNewResponse);
  }, [request._id, expanded]);

  // Marking fulfilled updates BOTH records: the BloodRequest's own status
  // (so it disappears from "open" lists elsewhere) AND this specific
  // Donation's status (so "Pending pickup" in the list below actually
  // changes to "Fulfilled" instead of staying stuck).
  async function handleMarkFulfilled(donationId, donorId) {
    setUpdating(true);
    try {
      await dispatch(
        updateRequestStatus({ requestId: request._id, status: "fulfilled", fulfilledBy: donorId })
      ).unwrap();

      const updatedDonation = await api.patch(`/donations/${donationId}`, { status: "completed" });
      setResponses((prev) =>
        (prev || []).map((r) => (r._id === donationId ? updatedDonation : r))
      );

      onStatusChanged();
    } finally {
      setUpdating(false);
    }
  }

  async function handleCancel() {
    setUpdating(true);
    try {
      await dispatch(updateRequestStatus({ requestId: request._id, status: "cancelled" })).unwrap();
      onStatusChanged();
    } finally {
      setUpdating(false);
    }
  }

  const isOpen = request.status === "open";

  return (
    <div className="request-row py-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <button onClick={toggleExpanded} aria-expanded={expanded} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            className={`shrink-0 text-ink-soft transition-transform ${expanded ? "rotate-90" : ""}`}
          >
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              {request.patientName}
              {hasLiveUpdate && (
                <span className="rounded-full bg-crimson px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  New response
                </span>
              )}
            </p>
            <p className="text-xs text-ink-soft">
              {request.bloodGroup} · {request.hospital} · {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={request.status} />
          {isOpen && (
            <button
              onClick={handleCancel}
              disabled={updating}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink disabled:opacity-60"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 rounded-xl border border-line bg-bg p-4 sm:ml-6">
          <p className="mb-3 text-xs font-medium text-ink-soft">Donors who responded</p>
          {responsesLoading ? (
            <div className="h-12 animate-pulse rounded-lg bg-surface" />
          ) : !responses || responses.length === 0 ? (
            <p className="break-words text-xs text-ink-soft">No responses yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {responses.map((res) => (
                <div
                  key={res._id}
                  className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center rounded-lg bg-surface px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {res.donor?.name} <span className="font-mono text-xs text-crimson">{res.donor?.bloodGroup}</span>
                    </p>
                    <p className="break-words text-xs text-ink-soft">
                      {res.donor?.phone} · {res.donor?.email}
                      {res.donor?.area && ` · ${res.donor.area}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={res.status} />
                    
                    {/* Real-time chat with the responding donor */}
                    <button
                      type="button"
                      onClick={() => setActiveChatDonation({ ...res, request })}
                      className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-action hover:text-action"
                      title="Open real-time chat with donor"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Chat
                    </button>

                    {isOpen && res.status === "scheduled" && (
                      <button
                        onClick={() => handleMarkFulfilled(res._id, res.donor?._id)}
                        disabled={updating}
                        className="rounded-full bg-action px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-action-hover disabled:opacity-60"
                      >
                        Mark fulfilled
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Real-Time Chat Modal */}
      {activeChatDonation && (
        <ChatModal
          donation={activeChatDonation}
          onClose={() => setActiveChatDonation(null)}
        />
      )}
    </div>
  );
}
