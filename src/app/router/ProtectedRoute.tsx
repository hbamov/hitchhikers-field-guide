import { Alert, Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";

export function ProtectedRoute() {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <Box
        role="status"
        aria-label="Loading account"
        sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
      >
        <CircularProgress />
      </Box>
    );

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (error) return <Alert severity="error">{error}</Alert>;

  return <Outlet />;
}
