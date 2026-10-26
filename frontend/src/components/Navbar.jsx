import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { markAllRead, dismissNotification } from "../store/notificationsSlice";
import ThemeToggle from "./ThemeToggle";

function getLinks(user) {
  if (!user) return [];
  if (user.role === "donor") {
    return [
      { to: "/requests", label: "Active Requests" },
      { to: "/donor", label: "Donor Dashboard" },
    ];
  }
  return [
    { to: "/requests", label: "Active Requests" },
    { to: "/requester", label: "My Requests" },
  ];
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-lg px-2 py-2.5 text-sm font-medium transition-colors ${
          isActive ? "bg-crimson-tint text-crimson" : "text-ink-soft hover:text-ink"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const links = getLinks(user);
  const notifications = useSelector((s) => s.notifications.items);
  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleLogout() {
    setOpen(false);
    navigate("/", { replace: true });
    setTimeout(() => logout(), 0);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        {user ? (
  <div className="flex items-center gap-2 cursor-default">
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#C81E3A" />
      <path
        d="M4 17h5l2.5-8 5 16 2.5-8H28"
        stroke="#F6F8F9"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="font-display text-lg font-semibold tracking-tight">
      ReliefNet
    </span>
  </div>
) : (
  <NavLink to="/" className="flex items-center gap-2">
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#C81E3A" />
      <path
        d="M4 17h5l2.5-8 5 16 2.5-8H28"
        stroke="#F6F8F9"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="font-display text-lg font-semibold tracking-tight">
      ReliefNet
    </span>
  </NavLink>
)}

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((l) => (
            <NavItem key={l.to} {...l} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {/* Notification bell — reads the Redux notifications slice */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-soft hover:text-ink"
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M8 1.5a4 4 0 0 0-4 4v2.2c0 .5-.2 1-.5 1.4L2.5 10.6c-.4.5 0 1.2.6 1.2h9.8c.6 0 1-.7.6-1.2l-1-1.5c-.3-.4-.5-.9-.5-1.4V5.5a4 4 0 0 0-4-4Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path d="M6.3 13.2a1.8 1.8 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-action font-mono text-[10px] text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border border-line bg-surface p-2 shadow-lg">
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-xs font-medium">Notifications</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => dispatch(markAllRead())}
                          className="text-xs text-crimson hover:text-crimson-dark"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-2 py-4 text-center text-xs text-ink-soft">Nothing yet.</p>
                    ) : (
                      <ul className="mt-1 flex max-h-72 flex-col gap-1 overflow-y-auto">
                        {notifications.map((n) => (
                          <li
                            key={n.id}
                            className={`flex items-start justify-between gap-2 rounded-lg px-2 py-2 text-xs ${
                              n.read ? "text-ink-soft" : "bg-crimson-tint text-ink"
                            }`}
                          >
                            <span>{n.message}</span>
                            <button
                              onClick={() => dispatch(dismissNotification(n.id))}
                              className="shrink-0 text-ink-soft hover:text-ink"
                              aria-label="Dismiss"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <span className="max-w-40 truncate font-mono text-xs text-ink-soft">
                {user.name} · {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-sm font-medium text-ink-soft hover:text-ink"
              >
                Log in
              </NavLink>
              <NavLink
                to="/admin/login"
                className="text-sm font-medium text-ink-soft hover:text-ink"
              >
                Admin
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-full bg-action px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-action-hover"
              >
                Register
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          className="flex h-11 w-11 items-center justify-center rounded-md border border-line lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            {open ? (
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-4 border-t border-line px-5 py-5 lg:hidden">
          {links.map((l) => (
            <NavItem key={l.to} {...l} onClick={() => setOpen(false)} />
          ))}
          <div className="mt-2 flex items-center gap-3 border-t border-line pt-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink"
              >
                Log out ({user.name})
              </button>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-ink-soft">
                  Log in
                </NavLink>
                <NavLink to="/admin/login" onClick={() => setOpen(false)} className="text-sm font-medium text-ink-soft">
                  Admin
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-action px-4 py-2 text-sm font-medium text-white"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
