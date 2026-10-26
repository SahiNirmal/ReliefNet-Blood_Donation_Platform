import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const { user, token: sessionToken } = await api.post("/users/reset-password", {
        token,
        newPassword,
      });
      // Logs them straight in rather than sending them back to a login
      // form — they've just proven control of the account via the link.
      setSession(user, sessionToken);
      navigate(user.role === "donor" ? "/donor" : "/requester");
    } catch (err) {
      setError(err.message || "Could not reset your password. Please request a new link.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <h1 className="font-display text-2xl font-semibold">Invalid reset link</h1>
        <p className="mt-2 text-sm text-ink-soft">
          This link is missing its reset token. Please request a new one.
        </p>
        <Link
          to="/forgot-password"
          className="mt-6 rounded-full bg-action px-5 py-2.5 text-sm font-medium text-white hover:bg-action-hover"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-shell mx-auto flex max-w-lg flex-col px-6 py-8 sm:px-10 sm:py-10">
      <p className="eyebrow font-mono text-xs uppercase tracking-wider text-crimson">
        Reset your password
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        Choose a new password
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          <span className="font-medium">New password</span>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="form-control rounded-xl border border-line bg-surface px-3.5 py-3 text-base sm:text-sm transition-colors focus:border-crimson"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          <span className="font-medium">Confirm new password</span>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            className="form-control rounded-xl border border-line bg-surface px-3.5 py-3 text-base sm:text-sm transition-colors focus:border-crimson"
          />
        </label>

        {error && <p role="alert" className="rounded-xl border border-crimson/20 bg-crimson-tint px-4 py-3 text-sm text-crimson-dark">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-action py-3 text-sm font-medium text-white transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          {submitting ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}