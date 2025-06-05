import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAdmin = sessionStorage.getItem("Admin") !== null;
  const isConsultant = sessionStorage.getItem("Consultant") !== null;

  const userRole = isAdmin ? "admin" : isConsultant ? "consultant" : "none";

  if (!allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (isConsultant) {
      return <Navigate to="/consultant-dashboard" replace />;
    } else if (isAdmin) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
