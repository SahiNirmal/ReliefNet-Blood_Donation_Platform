import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/users/forgot-password", { email });
      setResult(res);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell mx-auto flex max-w-lg flex-col px-6 py-8 sm:px-10 sm:py-10">
      <p className="eyebrow font-mono text-xs uppercase tracking-wider text-crimson">
        Reset your password
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        Forgot password?
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Enter the email on your account and we'll get you a reset link.
      </p>

      {!result ? (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="form-control rounded-xl border border-line bg-surface px-3.5 py-3 text-base sm:text-sm transition-colors focus:border-crimson"
            />
          </label>

          {error && <p role="alert" className="rounded-xl border border-crimson/20 bg-crimson-tint px-4 py-3 text-sm text-crimson-dark">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-action py-3 text-sm font-medium text-white transition-colors hover:bg-action-hover disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      ) : (
        <div className="mt-8 flex flex-col gap-5">
          <p className="rounded-lg bg-green-tint px-4 py-3 text-sm text-green">
            {result.message}
          </p>

          {/* This project has no email-sending service configured, so the
              reset link is shown directly here instead of being emailed —
              a real deployment would remove this block entirely and only
              send the link by email. */}
          {result.devResetUrl && (
            <div className="rounded-lg border border-dashed border-line bg-bg-alt px-4 py-3 text-xs text-ink-soft">
              <p className="font-medium text-ink">No email service is configured for this project.</p>
              <p className="mt-1">
                In a real deployment this link would be emailed to you. For now, here it is directly
                (expires in {result.expiresInMinutes} minutes):
              </p>
              <a
                href={result.devResetUrl}
                className="mt-2 block break-all font-mono text-crimson hover:text-crimson-dark"
              >
                {result.devResetUrl}
              </a>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link to="/login" className="font-medium text-crimson hover:text-crimson-dark">
          Back to log in
        </Link>
      </p>
    </div>
  );
}