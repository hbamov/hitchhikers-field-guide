import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { LogOut, Orbit } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Guide", to: "/guide" },
  { label: "Expedition Checklist", to: "/tasks" },
];

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
            gap: 2,
          }}
        >
          <Orbit color="#f2c14e" aria-hidden="true" />
          <Typography variant="subtitle1" sx={{ fontWeight: 750 }}>
            The Hitchhiker’s Field Guide
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Stack
            direction="row"
            spacing={1}
            component="nav"
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                color="inherit"
                sx={{
                  px: 1.5,
                  minWidth: 0,
                  color: "text.secondary",
                  "&.active": {
                    color: "secondary.main",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: "none", sm: "block" }, ml: 1 }}
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
