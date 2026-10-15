import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { LogOut, Orbit } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../features/auth/context/AuthContext";
import { LoungeChatProvider } from "../../features/loungeChat/context/LoungeChatContext";
import { LoungeChatDock } from "../../features/loungeChat/components/LoungeChatDock";

export function AppLayout() {
  const { user, signOutUser } = useAuth();
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
    await signOutUser();
    queryClient.clear();
    navigate("/login", { replace: true });
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
                  flexWrap: "wrap",
                  columnGap: 2,
                  py: { xs: 1, sm: 0 },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ minWidth: 0 }}
                >
                  <Orbit color="#f2c14e" aria-hidden="true" />
                  <Typography
                    variant="subtitle1"
                    noWrap
                    sx={{ fontWeight: 750 }}
                  >
                    The Hitchhiker’s Field Guide
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
                    order: { xs: 3, sm: 0 },
                    width: { xs: "100%", sm: "auto" },
                    overflowX: "auto",
                    mt: { xs: 0.5, sm: 0 },
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
                        "&.active": { color: "secondary.main" },
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ display: { xs: "none", md: "block" }, maxWidth: 160 }}
                >
                  {user?.displayName}
                </Typography>

                {/* Sign out: icon on phones, text button from sm up */}
                <IconButton
                  color="inherit"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  sx={{ display: { xs: "inline-flex", sm: "none" } }}
                >
                  <LogOut size={18} />
                </IconButton>
                <Button
                  color="inherit"
                  onClick={handleSignOut}
                  startIcon={<LogOut size={17} />}
                  sx={{ display: { xs: "none", sm: "inline-flex" } }}
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

          <LoungeChatDock />
        </Box>
      </LoungeChatProvider>
    </Box>
  );
}
