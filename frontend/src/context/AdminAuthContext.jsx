import { createContext, useState, useEffect, useCallback } from "react";

// Deliberately separate from AuthContext: admin access must never be
// obtainable through the normal donor/requester registration flow.
// eslint-disable-next-line react-refresh/only-export-components
export const AdminAuthContext = createContext(null);

const STORAGE_KEY = "reliefnet_admin_session";

// Hardcoded on the frontend for now because there is no backend yet to
// verify credentials against. This is NOT secure — anyone who reads the
// bundled JS can find these values — and exists only so the admin panel
// isn't reachable by simply registering an account. Experiment 6 (JWT
// auth) replaces this with a real admin account: a hashed password
// checked server-side, with a token issued on success.
const ADMIN_USERNAME = "admin@reliefnet.com";
const ADMIN_PASSWORD = "ReliefNet@Admin1";

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem(STORAGE_KEY) === "true");
    setLoading(false);
  }, []);

  const adminLogin = useCallback((username, password) => {
    const ok = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
    if (ok) {
      setIsAdmin(true);
      sessionStorage.setItem(STORAGE_KEY, "true");
    }
    return ok;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, loading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
