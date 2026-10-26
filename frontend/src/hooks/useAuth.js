import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Custom hook: components call useAuth() instead of importing
// useContext + AuthContext everywhere, and get a clear error if the
// hook is ever used outside the provider.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
