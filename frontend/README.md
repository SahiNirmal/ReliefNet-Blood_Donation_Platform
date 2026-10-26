# ReliefNet — Experiment 1

Real-Time Blood Donor–Requester Matching and Emergency Alert System.

## Experiment 1: Responsive & Interactive UIs using Tailwind CSS

This is the pure-frontend UI layer — no backend yet (that starts in Experiment 4).
All data is mocked in `src/data/mockData.js` so every page renders and is
interactive on its own.

### Pages built
- `/` — Landing page (hero, live stats, request preview, how-it-works)
- `/login` — Login
- `/register` — Register (donor / requester role toggle)
- `/donor` — Donor dashboard (profile, matches, donation history)
- `/request-blood` — Create emergency request form
- `/requests` — Browse & filter all active requests
- `/admin` — Admin panel (donors & requests tables)

### Run it
```bash
npm install
npm run dev
```
Then open the printed localhost URL. Fully responsive — resize the
window or open dev tools' device toolbar to check mobile/tablet/desktop.

### Design system
- Colors, fonts, and the signature "pulse line" (ECG heartbeat trace)
  motif are defined as Tailwind v4 theme tokens in `src/index.css`.
- Fonts: Space Grotesk (display), Inter (body), IBM Plex Mono (data/stats).

### What's next
Experiment 2 will wire in `useEffect`, `useContext`, and custom hooks —
starting with an Auth context and hooks that currently-mocked data will
flow through.
