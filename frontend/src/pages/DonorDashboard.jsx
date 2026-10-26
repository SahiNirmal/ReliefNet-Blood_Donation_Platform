import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PulseDivider from "../components/PulseDivider";
import StatusBadge from "../components/StatusBadge";
import RespondModal from "../components/RespondModal";
import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";
import { useGeolocation } from "../hooks/useGeolocation";
import { fetchRequests, respondToRequest } from "../store/requestsSlice";
import { api } from "../api/client";

export default function DonorDashboard() {
  const { user } = useAuth();
  const { location, status: geoStatus, retry: retryLocation } = useGeolocation();
  const dispatch = useDispatch();
  const [locationSaved, setLocationSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [modalRequest, setModalRequest] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (location && user?._id && !locationSaved) {
      api
        .patch(`/users/${user._id}`, { location: { lat: location.latitude, lng: location.longitude } })
        .then(() => {
          setLocationSaved(true);
          setSaveFailed(false);
        })
        // Previously swallowed silently. A donor whose location never reaches
        // the server can't be matched by distance, so say so on screen.
        .catch(() => setSaveFailed(true));
    }
  }, [location, user?._id, locationSaved]);

  const { items: matches, status: matchesStatus, respondedRequestIds } = useSelector((s) => s.requests);
  useEffect(() => {
    if (!user?.bloodGroup) return;
    const params = { bloodGroup: user.bloodGroup, status: "open" };
    if (location) {
      params.lat = location.latitude;
      params.lng = location.longitude;
      params.radiusKm = 25;
    }
    dispatch(fetchRequests(params));
  }, [dispatch, user?.bloodGroup, location]);
  const matchesLoading = matchesStatus === "loading";

  const { data: donationHistory, loading: historyLoading } = useFetch(
    () => (user?._id ? api.get(`/donations?donorId=${user._id}`) : Promise.resolve([])),
    [user?._id]
  );

  const alreadyRespondedIds = useMemo(() => {
    const fromHistory = (donationHistory || []).map((d) => d.request?._id || d.request);
    return new Set([...fromHistory, ...respondedRequestIds]);
  }, [donationHistory, respondedRequestIds]);

  async function handleConfirmRespond() {
    setConfirming(true);
    try {
      await dispatch(respondToRequest({ request: modalRequest })).unwrap();
      setModalRequest(null);
    } catch {
      // Modal stays open with the button re-enabled so they can retry.
    } finally {
      setConfirming(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="font-mono text-xs uppercase tracking-wider text-crimson">
        Donor dashboard
      </p>
      <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
        Welcome back, {user.name.split(" ")[0]}
      </h1>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-6 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-crimson-tint font-mono text-lg font-semibold text-crimson-dark">
              {user.bloodGroup}
            </div>
            <div>
              <h2 className="font-medium">{user.name}</h2>
              <p className="text-sm text-ink-soft">{user.area}</p>
            </div>
          </div>

          <PulseDivider className="mt-6 w-full text-crimson/60" height={28} />

          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Total donations" value={donationHistory?.length ?? 0} />
            <Row
              label="Last donation"
              value={user.lastDonationDate ? new Date(user.lastDonationDate).toLocaleDateString() : "—"}
            />
            <Row label="Availability" value={user.isAvailable === false ? "Unavailable" : "Available"} />
          </dl>

          <div className="mt-4 rounded-lg bg-bg-alt px-3 py-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Location for matching</span>
              <LocationBadge status={geoStatus} location={location} saved={locationSaved} saveFailed={saveFailed} />
            </div>
            <LocationHelp status={geoStatus} saveFailed={saveFailed} onRetry={retryLocation} />
          </div>

          <button className="mt-6 w-full rounded-full border border-line py-2.5 text-sm font-medium transition-colors hover:border-ink">
            Edit profile
          </button>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium">Requests matching your blood group</h2>
              <span className="font-mono text-xs text-ink-soft">
                {matchesLoading ? "Loading…" : `${matches.length} ${location ? "nearby" : "matching"}`}
              </span>
            </div>

            {matchesLoading ? (
              <div className="flex flex-col gap-3 py-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-bg-alt" />
                ))}
              </div>
            ) : matches.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-soft">
                No open requests match your blood group right now.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {matches.map((r) => {
                  const responded = alreadyRespondedIds.has(r._id);
                  return (
                    <div key={r._id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-medium">{r.patientName}</p>
                        <p className="text-xs text-ink-soft">
                          {r.hospital} · {new Date(r.createdAt).toLocaleDateString()}
                          {typeof r.distanceKm === "number" && ` · ${r.distanceKm.toFixed(1)} km away`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={r.urgency} />
                        {responded ? (
                          <span className="rounded-full border border-green/30 bg-green-tint px-4 py-1.5 text-xs font-medium text-green">
                            Responded ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => setModalRequest(r)}
                            className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-crimson"
                          >
                            Respond
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-4 font-medium">Your donation history</h2>
            {historyLoading ? (
              <div className="h-24 animate-pulse rounded-lg bg-bg-alt" />
            ) : !donationHistory || donationHistory.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-soft">
                You haven't logged any donations yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs text-ink-soft">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Patient</th>
                      <th className="pb-2 font-medium">Hospital</th>
                      <th className="pb-2 font-medium">Units</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {donationHistory.map((h) => (
                      <tr key={h._id}>
                        <td className="py-3">{new Date(h.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">{h.request?.patientName || "—"}</td>
                        <td className="py-3 text-ink-soft">{h.hospital}</td>
                        <td className="py-3 font-mono">{h.units}</td>
                        <td className="py-3">
                          <StatusBadge status={h.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <RespondModal
        request={modalRequest}
        onCancel={() => setModalRequest(null)}
        onConfirm={handleConfirmRespond}
        confirming={confirming}
      />
    </div>
  );
}

function LocationBadge({ status, location, saved, saveFailed }) {
  if (status === "locating") return <span className="font-mono text-ink-soft">Locating…</span>;
  if (status === "granted" && location)
    return (
      <span className={`font-mono ${saveFailed ? "text-amber" : "text-green"}`}>
        {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
        {saved ? " · saved" : saveFailed ? " · not saved" : ""}
      </span>
    );
  if (status === "denied") return <span className="font-mono text-amber">Blocked</span>;
  if (status === "unavailable") return <span className="font-mono text-amber">Unavailable</span>;
  if (status === "timeout") return <span className="font-mono text-amber">Timed out</span>;
  if (status === "unsupported") return <span className="font-mono text-ink-soft">Not supported</span>;
  return <span className="font-mono text-ink-soft">—</span>;
}

const LOCATION_HELP = {
  denied:
    "Your browser has location blocked for this site, so it won't ask again. Click the icon left of the address bar, open Site settings, set Location to Allow, then press Retry.",
  unavailable:
    "Permission is fine, but your device couldn't work out where it is. On Windows, check that Settings > Privacy & security > Location is switched on, then press Retry.",
  timeout: "Finding your location took too long. Press Retry.",
  unsupported: "This browser doesn't support location, so distance matching isn't available.",
};

function LocationHelp({ status, saveFailed, onRetry }) {
  let message = LOCATION_HELP[status];
  if (!message && saveFailed) {
    message =
      "Your location was found but couldn't be saved to your profile, so nearby alerts may miss you. Press Retry.";
  }
  if (!message) return null;

  return (
    <div className="mt-2 border-t border-line pt-2 text-ink-soft">
      <p>{message}</p>
      {status !== "unsupported" && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-full border border-line bg-white px-3 py-1 font-medium text-ink transition-colors hover:border-ink"
        >
          Retry
        </button>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-mono font-medium">{value}</dd>
    </div>
  );
}