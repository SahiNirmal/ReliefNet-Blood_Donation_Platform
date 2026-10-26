import { createContext, useState, useEffect, useCallback } from "react";
import { api, tokenStorage } from "../api/client";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const STORAGE_KEY = "reliefnet_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first load. The token itself lives separately in
  // tokenStorage (read automatically by api/client.js on every request);
  // this just restores the display-friendly user object.
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Both endpoints now return { user, token } — the token is a real JWT,
  // signed by the backend, that api/client.js attaches to every
  // subsequent request as "Authorization: Bearer <token>". Every route
  // that trusts identity (creating a request, responding as a donor,
  // updating your own profile) now reads that identity from this token
  // server-side, not from anything the client claims in a request body.
  const login = useCallback(async ({ email, password }) => {
    const { user: loggedInUser, token } = await api.post("/users/login", { email, password });
    setUser(loggedInUser);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    tokenStorage.set(token);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: newUser, token } = await api.post("/users/register", payload);
    setUser(newUser);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    tokenStorage.set(token);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
    tokenStorage.clear();
  }, []);

  const setSession = useCallback((sessionUser, token) => {
    setUser(sessionUser);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    tokenStorage.set(token);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}