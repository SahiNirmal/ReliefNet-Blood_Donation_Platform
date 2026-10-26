import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function AdminProtectedRoute({ children }) {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return children;
}
