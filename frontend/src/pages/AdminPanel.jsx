import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import StatusBadge from "../components/StatusBadge";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useFetch } from "../hooks/useFetch";
import { api } from "../api/client";
import { fetchRequests } from "../store/requestsSlice";
import { fetchDonors } from "../store/donorsSlice";

export default function AdminPanel() {
  const { adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: requests, status: requestsStatus } = useSelector((s) => s.requests);
  const { items: donors, status: donorsStatus } = useSelector((s) => s.donors);
  const { data: stats } = useFetch(() => api.get("/stats"), []);

  useEffect(() => {
    dispatch(fetchRequests({}));
    dispatch(fetchDonors({}));
  }, [dispatch]);

  function handleLogout() {
    adminLogout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-page page-shell mx-auto max-w-6xl px-5 py-8 sm:py-12 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="eyebrow font-mono text-xs uppercase tracking-wider text-crimson">
            Admin
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Network overview
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
        >
          Log out
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Active requests" value={stats?.activeRequests ?? "—"} tone="crimson" />
        <SummaryCard label="Registered donors" value={stats?.registeredDonors ?? "—"} tone="navy" />
        <SummaryCard label="Lives saved" value={stats?.livesSaved ?? "—"} tone="green" />
      </div>

      {/* Requests table — Redux, shared with Browse Requests / dashboards */}
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight">Emergency requests</h2>
          <span className="font-mono text-xs text-ink-soft">
            {requestsStatus === "loading" ? "Loading…" : `${requests.length} total`}
          </span>
        </div>
        <div tabIndex={0} role="region" aria-label="Scrollable network records" className="table-scroll panel overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="data-table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-soft">
                <th scope="col" className="px-5 py-3 font-medium">Patient</th>
                <th scope="col" className="px-5 py-3 font-medium">Group</th>
                <th scope="col" className="px-5 py-3 font-medium">Units</th>
                <th scope="col" className="px-5 py-3 font-medium">Hospital</th>
                <th scope="col" className="px-5 py-3 font-medium">Urgency</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <p role="status" className="empty-state rounded-xl px-5 py-10 text-center text-sm text-ink-soft">
                      {requestsStatus === "loading" ? "Loading emergency requests…" : requestsStatus === "failed" ? "Requests could not be loaded." : "No emergency requests to display."}
                    </p>
                  </td>
                </tr>
              )}
              {requests.map((r) => (
                <tr key={r._id}>
                  <td className="px-5 py-3">{r.patientName}</td>
                  <td className="px-5 py-3 font-mono">{r.bloodGroup}</td>
                  <td className="px-5 py-3 font-mono">{r.unitsNeeded}</td>
                  <td className="px-5 py-3 text-ink-soft">{r.hospital}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.urgency} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Donors table — Redux */}
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold tracking-tight">Registered donors</h2>
          <span className="font-mono text-xs text-ink-soft">
            {donorsStatus === "loading" ? "Loading…" : `${donors.length} shown`}
          </span>
        </div>
        <div tabIndex={0} role="region" aria-label="Scrollable network records" className="table-scroll panel overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="data-table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-soft">
                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                <th scope="col" className="px-5 py-3 font-medium">Group</th>
                <th scope="col" className="px-5 py-3 font-medium">Area</th>
                <th scope="col" className="px-5 py-3 font-medium">Last donation</th>
                <th scope="col" className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {donors.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <p role="status" className="empty-state rounded-xl px-5 py-10 text-center text-sm text-ink-soft">
                      {donorsStatus === "loading" ? "Loading registered donors…" : donorsStatus === "failed" ? "Donors could not be loaded." : "No registered donors to display."}
                    </p>
                  </td>
                </tr>
              )}
              {donors.map((d) => (
                <tr key={d._id}>
                  <td className="px-5 py-3">{d.name}</td>
                  <td className="px-5 py-3 font-mono">{d.bloodGroup}</td>
                  <td className="px-5 py-3 text-ink-soft">{d.area}</td>
                  <td className="px-5 py-3">
                    {d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={d.isAvailable === false ? "unavailable" : "available"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, tone }) {
  const toneClasses = {
    crimson: "text-crimson",
    navy: "text-navy",
    green: "text-green",
  };
  return (
    <div className="summary-card rounded-2xl border border-line bg-surface p-6">
      <p className={`font-mono text-4xl font-semibold tracking-tight ${toneClasses[tone]}`}>{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}
