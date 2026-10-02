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
