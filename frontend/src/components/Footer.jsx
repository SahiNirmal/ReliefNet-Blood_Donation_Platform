export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="font-display text-base font-semibold">ReliefNet</span>
            <p className="mt-2 max-w-xs text-sm text-ink-soft">
              A real-time network connecting blood donors to emergency
              requests the moment they're posted.
            </p>
          </div>
          <div className="flex flex-wrap gap-10 font-mono text-xs text-ink-soft">
            <div>
              <p className="mb-2 text-ink">Platform</p>
              <ul className="space-y-1.5">
                <li>Active Requests</li>
                <li>Donor Dashboard</li>
                <li>Request Blood</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-ink">Network</p>
              <ul className="space-y-1.5">
                <li>342 donors</li>
                <li>7 active alerts</li>
                <li>128 lives saved</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-line pt-6 text-xs text-ink-soft">
          Built as a Full Stack Lab semester project — ReliefNet.
        </p>
      </div>
    </footer>
  );
}
