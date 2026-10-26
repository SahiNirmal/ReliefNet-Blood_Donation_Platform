import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function AdminLogin() {
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const ok = adminLogin(username, password);
    if (ok) {
      navigate("/admin");
    } else {
      setError("Incorrect username or password.");
    }
  }

  return (
    <div className="auth-shell admin-auth mx-auto flex max-w-lg flex-col px-6 py-8 sm:px-10 sm:py-10">
      <p className="eyebrow font-mono text-xs uppercase tracking-wider text-navy">
        Restricted access
      </p>
      <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">
        Admin sign in
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        This panel is for ReliefNet administrators only.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          <span className="font-medium">Admin username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-control rounded-xl border border-line bg-surface px-3.5 py-3 text-base sm:text-sm transition-colors focus:border-navy"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-2 text-sm">
          <span className="font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control rounded-xl border border-line bg-surface px-3.5 py-3 text-base sm:text-sm transition-colors focus:border-navy"
          />
        </label>

        {error && <p role="alert" className="rounded-xl border border-crimson/20 bg-crimson-tint px-4 py-3 text-sm text-crimson-dark">{error}</p>}

        <button
          type="submit"
          className="mt-2 rounded-full bg-action-navy py-3 text-sm font-medium text-white transition-colors hover:bg-action-navy/90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
