import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  Alert,
  Snackbar,
  Divider,
  Avatar,
} from "@mui/material";
import { LogOut, Orbit } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/context/AuthContext";
import { LoungeChatProvider } from "../../features/loungeChat/context/LoungeChatContext";
import { LoungeChatDock } from "../../features/loungeChat/components/LoungeChatDock/LoungeChatDock";

function getInitials(name?: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0][0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function AppLayout() {
  const { user, signOutUser } = useAuth();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const navItems = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Guide", to: "/guide" },
    { label: "Checklist", to: "/tasks" },
    ...(user?.role === "administrator"
      ? [{ label: "Admin", to: "/admin/guide" }]
      : []),
  ];

  async function handleSignOut() {
    try {
      setSignOutError(null);
      await signOutUser();
      queryClient.clear();
      navigate("/login", { replace: true });
    } catch {
      setSignOutError("Couldn’t sign you out. Please try again.");
    }
  }

  return (
    <LoungeChatProvider>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          overflowX: "hidden",
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}
        >
          <Container maxWidth="md">
            <Toolbar
              disableGutters
              sx={{
                // mobile: 2 rows, desktop: 1 row
                flexWrap: { xs: "wrap", sm: "nowrap" },
                columnGap: { xs: 1, sm: 1.25 },
                py: { xs: 1, sm: 0 },
                minHeight: { sm: 64 },
              }}
            >
              {/* Brand */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ minWidth: 0, flexShrink: 0 }}
              >
                <Orbit
                  color="#f2c14e"
                  aria-hidden="true"
                  size={24}
                  style={{ flexShrink: 0 }}
                />
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{
                    fontWeight: 750,
                    display: { xs: "none", sm: "block", lg: "none" },
                  }}
                >
                  HHFG
                </Typography>
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{
                    fontWeight: 750,
                    display: { xs: "block", sm: "none", lg: "block" },
                  }}
                >
                  The Hitchhiker’s Field Guide
                </Typography>
              </Stack>

              <Box sx={{ flexGrow: 1 }} />

              {/* Sign out icon on mobile / tablet */}
              <IconButton
                onClick={handleSignOut}
                aria-label="Sign out"
                sx={{
                  display: { xs: "inline-flex", sm: "none" },
                  border: "1px solid rgba(255,255,255,.24)",
                  "&:hover": {
                    borderColor: "error.light",
                    color: "error.light",
                  },
                }}
              >
                <LogOut size={18} />
              </IconButton>

              {/* Nav row: full width under header on mobile */}
              <Stack
                component="nav"
                aria-label="Primary"
                direction="row"
                spacing={0.5}
                sx={{
                  order: { xs: 3, sm: 0 },
                  width: { xs: "100%", sm: "auto" },
                  flex: { sm: "0 1 auto" },
                  minWidth: 0,
                  mt: { xs: 0.5, sm: 0 },
                  overflowX: "auto",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {navItems.map((item) => (
                  <Button
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    color="inherit"
                    size="small"
                    sx={{
                      px: 1.5,
                      minWidth: 0,
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      color: "text.secondary",
                      borderRadius: 999,
                      "&:hover": { color: "text.primary" },
                      "&.active": {
                        color: "secondary.main",
                        bgcolor: "action.selected",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>

              {/* Desktop identity + text sign out */}
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  mx: 1.5,
                  my: 1.5,
                  display: { xs: "none", sm: "none", lg: "block" },
                }}
              />

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ display: { xs: "none", lg: "flex" }, mr: 1.5 }}
              >
                <Avatar
                  aria-hidden="true"
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: 12,
                    fontWeight: 700,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  {getInitials(user?.displayName)}
                </Avatar>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    display: { xs: "none", xl: "block" },
                    maxWidth: 140,
                    color: "text.primary",
                    fontWeight: 600,
                  }}
                >
                  {user?.displayName}
                </Typography>
              </Stack>

              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleSignOut}
                startIcon={<LogOut size={16} />}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  borderColor: "rgba(255,255,255,.24)",
                  "&:hover": {
                    borderColor: "error.light",
                    color: "error.light",
                    bgcolor: "transparent",
                  },
                }}
              >
                Sign out
              </Button>
            </Toolbar>
          </Container>
        </AppBar>

        <Container
          maxWidth="md"
          sx={{
            py: { xs: 3, sm: 8 },
            pb: { xs: 12, sm: 12 },
          }}
        >
          <Outlet />
        </Container>

        <Snackbar
          open={Boolean(signOutError)}
          autoHideDuration={4000}
          onClose={() => setSignOutError(null)}
        >
          <Alert severity="error" onClose={() => setSignOutError(null)}>
            {signOutError}
          </Alert>
        </Snackbar>

        <LoungeChatDock />
      </Box>
    </LoungeChatProvider>
  );
}
