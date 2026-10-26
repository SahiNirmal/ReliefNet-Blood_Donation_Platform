// The heartbeat trace is ReliefNet's signature visual element: it appears
// large in the hero and as a slim divider between sections elsewhere,
// tying every screen back to the idea of a life-signal being monitored.
export default function PulseDivider({ className = "", height = 48 }) {
  return (
    <svg
      viewBox="0 0 400 60"
      className={`block ${className}`}
      style={{ height }}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="pulse-line"
        d="M0 30 H120 L140 30 L155 8 L172 52 L188 30 L205 30 L215 18 L225 30 H400"
      />
    </svg>
  );
}
