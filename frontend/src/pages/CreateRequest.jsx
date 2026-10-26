import { useState } from "react";
import { useDispatch } from "react-redux";
import { bloodGroups } from "../data/mockData";
import { createRequest } from "../store/requestsSlice";
import { useAuth } from "../hooks/useAuth";
import { useGeolocation } from "../hooks/useGeolocation";

const urgencyOptions = [
  { value: "critical", label: "Critical — needed within hours" },
  { value: "urgent", label: "Urgent — needed within 1–2 days" },
  { value: "stable", label: "Stable — planned requirement" },
];

const initialForm = { patientName: "", bloodGroup: "", unitsNeeded: 1, hospital: "", contactNumber: "" };

export default function CreateRequest() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { location } = useGeolocation();
  const [urgency, setUrgency] = useState("urgent");
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [nearbyDonorsMatched, setNearbyDonorsMatched] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Dispatches to the requests Redux slice, which POSTs to the real
      // Experiment 4 API, including the patient's location if the browser
      // granted it — the backend uses that to count nearby matching
      // donors right now. Actually pushing an alert to those donors'
      // screens live needs WebSockets (Experiment 8); this count is
      // computed at the moment the request is posted, not streamed.
      const result = await dispatch(
  createRequest({
    ...form,
    unitsNeeded: Number(form.unitsNeeded),
    urgency,
    location: location ? { lat: location.latitude, lng: location.longitude } : undefined,
  })
).unwrap();
      setNearbyDonorsMatched(result.nearbyDonorsMatched);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Could not post the request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-crimson-tint">
          <span className="h-3 w-3 animate-pulse rounded-full bg-action" />
        </div>
        <h1 className="font-display text-2xl font-semibold">Request posted</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {typeof nearbyDonorsMatched === "number"
            ? `${nearbyDonorsMatched} matching donor${nearbyDonorsMatched === 1 ? "" : "s"} found within 25 km. `
            : "Matching donors are being identified. "}
          You'll be notified as soon as someone responds.
        </p>
        <button
          onClick={() => {
            setForm(initialForm);
            setSubmitted(false);
            setNearbyDonorsMatched(null);
          }}
          className="mt-6 rounded-full border border-line px-5 py-2.5 text-sm font-medium hover:border-ink"
        >
          Post another request
        </button>
      </div>
    );
  }

  return (
    <div className="auth-shell mx-auto max-w-xl px-6 py-8 sm:px-10 sm:py-10">
      <p className="eyebrow font-mono text-xs uppercase tracking-wider text-crimson">
        Emergency request
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        Post a blood request
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Matching donors nearby will be alerted the moment this is posted.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <Field label="Patient name" placeholder="Full name" value={form.patientName} onChange={update("patientName")} required />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium">Blood group needed</span>
            <select
              required
              value={form.bloodGroup}
              onChange={update("bloodGroup")}
              className="form-control rounded-xl border border-line bg-surface px-3.5 py-3 text-base sm:text-sm transition-colors focus:border-crimson"
            >
              <option value="">Select</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Units needed"
            type="number"
            min="1"
            placeholder="e.g. 2"
            value={form.unitsNeeded}
            onChange={update("unitsNeeded")}
            required
          />
        </div>

        <Field
          label="Hospital / location"
          placeholder="Hospital name, city"
          value={form.hospital}
          onChange={update("hospital")}
          required
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">Urgency level</legend>
          {urgencyOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                urgency === opt.value
                  ? "border-crimson bg-crimson-tint"
                  : "border-line bg-surface hover:border-ink"
              }`}
            >
              <input
                type="radio"
                name="urgency"
                value={opt.value}
                checked={urgency === opt.value}
                onChange={() => setUrgency(opt.value)}
                className="h-4 w-4 accent-crimson"
              />
              {opt.label}
            </label>
          ))}
        </fieldset>

        <Field
          label="Contact number"
          type="tel"
          placeholder="+91 "
          value={form.contactNumber}
          onChange={update("contactNumber")}
          required
        />

        {error && <p role="alert" className="rounded-xl border border-crimson/20 bg-crimson-tint px-4 py-3 text-sm text-crimson-dark">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-action py-3 text-sm font-medium text-white transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post request & alert donors"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        {...props}
        className="form-control rounded-xl border border-line bg-surface px-3.5 py-3 text-base sm:text-sm transition-colors focus:border-crimson"
      />
    </label>
  );
}
