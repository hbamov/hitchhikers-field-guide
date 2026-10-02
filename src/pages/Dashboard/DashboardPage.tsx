import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { MapPin, ShieldAlert, Sparkles } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { dashboardMessages } from "./dashboardMessages";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="overline"
          color="secondary.main"
          letterSpacing=".16em"
        >
          {dashboardMessages.briefing}
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: "2.1rem", sm: "3rem" } }}
        >
          {dashboardMessages.welcome(
            user?.displayName || dashboardMessages.defaultDisplayName,
          )}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {dashboardMessages.description}
        </Typography>
      </Box>
      <Alert severity="info" icon={<ShieldAlert size={20} />}>
        {dashboardMessages.advisory}
      </Alert>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              color="secondary.main"
            >
              <MapPin size={20} />
              <Typography variant="overline">
                {dashboardMessages.featuredDestination}
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ mt: 1 }}>
              Magrathea
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Legendary planet of custom-built worlds. Booking windows are
              measured in geological eras.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip
                size="small"
                label="CLASSIFIED: MYTHICAL"
                color="secondary"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              color="primary.main"
            >
              <Sparkles size={20} />
              <Typography variant="overline">
                {dashboardMessages.checklist.title}
              </Typography>
            </Stack>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {dashboardMessages.checklist.empty}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {dashboardMessages.checklist.description}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, fontFamily: "monospace" }}>
              ESSENTIAL ITEM 01: TOWEL
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {dashboardMessages.accountSummary(
          user?.email || "Unknown",
          user?.role || "User",
        )}
      </Typography>
    </Stack>
  );
}
