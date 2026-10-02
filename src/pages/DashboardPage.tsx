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
import { useAuth } from "../features/auth/context/AuthContext";

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
          TRAVELER’S BRIEFING
        </Typography>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: "2.1rem", sm: "3rem" } }}
        >
          Good to have you, {user?.displayName}.
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Your guide is ready. Your destination may or may not be.
        </Typography>
      </Box>
      <Alert severity="info" icon={<ShieldAlert size={20} />}>
        Galactic advisory: check local customs before offering anyone a cup of
        tea.
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
              <Typography variant="overline">FEATURED DESTINATION</Typography>
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
              <Typography variant="overline">TRAVEL CHECKLIST</Typography>
            </Stack>
            <Typography variant="h5" sx={{ mt: 1 }}>
              No tasks yet
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              When task management arrives, this is where your packing list will
              appear.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, fontFamily: "monospace" }}>
              ESSENTIAL ITEM 01: TOWEL
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <Typography variant="caption" color="text.secondary">
        You are signed in as {user?.email} · role: {user?.role}
      </Typography>
    </Stack>
  );
}
