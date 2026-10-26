import { Link } from "react-router-dom";
import PulseDivider from "../components/PulseDivider";
import HeroSignalPanel from "../components/HeroSignalPanel";
import RequestCard from "../components/RequestCard";
import { stats, emergencyRequests } from "../data/mockData";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-section border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:pt-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="flex flex-col items-start gap-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-crimson/25 bg-crimson-tint px-3 py-1 font-mono text-xs text-crimson-dark">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-action" />
                {stats.activeRequests} active emergency requests right now
              </span>

              <h1 className="font-display max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
                Every drop finds a{" "}
                <span className="text-crimson">signal.</span>
              </h1>

              <p className="max-w-lg text-base text-ink-soft sm:text-lg">
                ReliefNet alerts nearby donors the instant a hospital or
                family posts an emergency blood request — turning a search
                that used to take hours into one that takes minutes.
              </p>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  to="/register"
                  className="rounded-full bg-action px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-action-hover"
                >
                  Register as a donor
                </Link>
                <Link
                  to="/request-blood"
                  className="rounded-full border border-line bg-surface px-6 py-3 text-center text-sm font-medium text-ink transition-colors hover:border-ink"
                >
                  Post an emergency request
                </Link>
              </div>
            </div>

            <HeroSignalPanel />
          </div>

          <PulseDivider className="mt-14 w-full text-crimson" height={64} />

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8 sm:gap-8">
            <Stat label="Active requests" value={stats.activeRequests} />
            <Stat label="Registered donors" value={stats.registeredDonors} />
            <Stat label="Lives saved" value={stats.livesSaved} />
          </div>
        </div>
      </section>

      {/* Live requests preview */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow font-mono text-xs uppercase tracking-wider text-crimson">
              Live feed
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Requests needing donors now
            </h2>
          </div>
          <Link
            to="/requests"
            className="hidden text-sm font-medium text-crimson hover:text-crimson-dark sm:inline"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {emergencyRequests.slice(0, 3).map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>

        <Link
          to="/requests"
          className="mt-8 block text-center text-sm font-medium text-crimson hover:text-crimson-dark sm:hidden"
        >
          View all requests →
        </Link>
      </section>

      {/* How it works */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            How the signal travels
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <Step
              n="1"
              title="A request goes out"
              body="A hospital or family posts the patient's blood group, units needed, and urgency level."
            />
            <Step
              n="2"
              title="Matching donors get alerted"
              body="Donors with the right blood group nearby receive a live alert the moment the request is posted."
            />
            <Step
              n="3"
              title="A donor responds"
              body="The first available donor confirms, and the requester sees the status update in real time."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="font-mono text-2xl font-semibold sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-ink-soft sm:text-sm">{label}</p>
    </div>
  );
}

function Step({ n, title, body }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-line bg-bg p-5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crimson-tint font-mono text-sm text-crimson">{n}</span>
      <div>
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm text-ink-soft">{body}</p>
      </div>
    </div>
  );
}
