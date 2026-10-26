import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Wrap any route that should only be reachable by a logged-in donor or
// requester. `allowedRoles` restricts further (e.g. only "donor").
// Not logged in -> sent to /login, remembering where they were headed.
// Logged in but wrong role -> sent to their own home instead of an error page.
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "donor" ? "/donor" : "/requester";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
