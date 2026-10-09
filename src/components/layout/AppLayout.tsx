import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { LogOut, Orbit } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { NavLink } from "react-router-dom";

export function AppLayout() {
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();
  async function handleSignOut() {
    await signOutUser();
    navigate("/login", { replace: true });
  }
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}
      >
        <Toolbar
          sx={{
            maxWidth: 1100,
            width: "100%",
            mx: "auto",
            px: { xs: 2, sm: 3 },
          }}
        >
          <Orbit color="#f2c14e" aria-hidden="true" />
          <Typography
            variant="subtitle1"
            sx={{ ml: 1.2, flexGrow: 1, fontWeight: 750 }}
          >
            The Hitchhiker’s Field Guide
          </Typography>
          <nav className="flex items-center gap-6">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-amber-400"
                  : "text-slate-400 hover:text-slate-100"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/guide"
              className={({ isActive }) =>
                isActive
                  ? "text-amber-400"
                  : "text-slate-400 hover:text-slate-100"
              }
            >
              Guide
            </NavLink>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                isActive
                  ? "text-amber-400"
                  : "text-slate-400 hover:text-slate-100"
              }
            >
              Tasks
            </NavLink>
          </nav>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" }, mr: 2 }}
          >
            {user?.displayName}
          </Typography>
          <Button
            color="inherit"
            onClick={handleSignOut}
            startIcon={<LogOut size={17} />}
            aria-label="Sign out"
          >
            Sign out
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: { xs: 5, sm: 8 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
