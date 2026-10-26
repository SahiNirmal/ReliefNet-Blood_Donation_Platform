// Hero visual for the right column: a looping heartbeat monitor with
// floating "donor matched" notifications, reusing the pulse-line motif
// as a live, ambient signal rather than a static illustration.
export default function HeroSignalPanel() {
  return (
    <div className="relative hidden aspect-square w-full max-w-md items-center justify-center lg:flex">
      {/* Monitor card */}
      <div className="relative w-full overflow-hidden rounded-3xl signal-monitor bg-monitor p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="eyebrow font-mono text-xs uppercase tracking-wider text-white/75">
            Live network signal
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs text-white/70">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Online
          </span>
        </div>

        {/* Scrolling ECG trace */}
        <div className="mt-8 h-28 w-full overflow-hidden">
          <svg
            viewBox="0 0 400 100"
            className="h-full ecg-scroll"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 50 H60 L75 50 L90 15 L105 85 L120 50 L400 50
                 M400 50 H460 L475 50 L490 15 L505 85 L520 50 L800 50"
              stroke="#F4677E"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 font-mono text-white">
          <div>
            <p className="text-lg font-semibold">7</p>
            <p className="text-[11px] text-white/75">requests</p>
          </div>
          <div>
            <p className="text-lg font-semibold">342</p>
            <p className="text-[11px] text-white/75">donors</p>
          </div>
          <div>
            <p className="text-lg font-semibold">128</p>
            <p className="text-[11px] text-white/75">saved</p>
          </div>
        </div>
      </div>

      {/* Floating notification: match found */}
      <div className="absolute -left-2 top-6 w-56 rounded-2xl border border-line bg-surface p-4 shadow-lg float-slow">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-tint font-mono text-[10px] font-semibold text-green">
            O-
          </span>
          <p className="text-xs font-medium">Donor matched</p>
        </div>
        <p className="mt-1.5 text-[11px] text-ink-soft">
          Aditya R. near Andheri East · 2 min ago
        </p>
      </div>

      {/* Floating notification: alert sent */}
      <div className="absolute -bottom-4 -right-2 w-52 rounded-2xl border border-line bg-surface p-4 shadow-lg float-slow-delayed">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-action" />
          <p className="text-xs font-medium">Alert broadcast</p>
        </div>
        <p className="mt-1.5 text-[11px] text-ink-soft">
          12 matching donors notified
        </p>
      </div>
    </div>
  );
}
