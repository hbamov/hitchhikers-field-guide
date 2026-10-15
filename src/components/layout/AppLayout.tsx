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

  function getInitials(name?: string | null): string {
    const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    return ((parts[0][0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
  }

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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        overflowX: "hidden",
      }}
    >
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
                  flexWrap: "nowrap", // was wrap
                  minHeight: 64,
                  columnGap: 1.25,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ minWidth: 0 }}
                >
                  <Orbit color="#f2c14e" aria-hidden="true" />
                  <Typography sx={{ display: { xs: "none", lg: "block" } }}>
                    The Hitchhiker’s Field Guide
                  </Typography>
                  <Typography
                    sx={{
                      display: { xs: "block", lg: "none" },
                      fontWeight: 750,
                    }}
                  >
                    HHFG
                  </Typography>
                </Stack>

                <Box sx={{ flexGrow: 1 }} />

                {/* Nav: second row on phones, inline from sm up */}
                <Stack
                  component="nav"
                  aria-label="Primary"
                  direction="row"
                  spacing={0.5}
                  sx={{
                    flex: "1 1 auto",
                    minWidth: 0,
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

                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    mx: 1.5,
                    my: 1.5,
                    display: { xs: "none", sm: "block" },
                  }}
                />

                {/* Identity: not clickable, so it looks different from the nav */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ display: { xs: "none", sm: "flex" }, mr: 1.5 }}
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
                  <Typography sx={{ display: { xs: "none", xl: "block" } }}>
                    {user?.displayName}
                  </Typography>
                </Stack>

                {/* Sign out: outlined so it reads as an action */}
                <IconButton
                  sx={{ display: { xs: "inline-flex", sm: "none" } }}
                  aria-label="Sign out"
                >
                  <LogOut size={18} />
                </IconButton>
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

          {/* Extra bottom padding so the minimized chat bar never covers content */}
          <Container
            maxWidth="md"
            sx={{
              py: { xs: 3, sm: 8 },
              pb: { xs: 12, sm: 12 }, // keep enough room for dock bar + thumb reach
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
    </Box>
  );
}
