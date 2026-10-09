import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { MapPin, ShieldAlert, Sparkles } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useTravelTasks } from "../../features/travelTasks/hooks/useTravelTasks";
import { dashboardMessages } from "./dashboardMessages";

const PREVIEW_LIMIT = 3;

export function DashboardPage() {
  const { user } = useAuth();
  const { data: tasks = [], isLoading, isError } = useTravelTasks(user?.uid);

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status === "open"),
    [tasks],
  );
  const previewTasks = openTasks.slice(0, PREVIEW_LIMIT);

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

            {isLoading ? (
              <Stack spacing={1} sx={{ mt: 1.5 }} aria-busy="true">
                <Skeleton variant="rounded" height={32} width="60%" />
                <Skeleton variant="rounded" height={20} />
                <Skeleton variant="rounded" height={20} width="80%" />
              </Stack>
            ) : isError ? (
              <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                We couldn’t load your checklist right now.
              </Typography>
            ) : openTasks.length === 0 ? (
              <>
                <Typography variant="h5" sx={{ mt: 1 }}>
                  {tasks.length === 0
                    ? dashboardMessages.checklist.empty
                    : "All clear"}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {tasks.length === 0
                    ? "Add essentials for your next journey, starting with a towel."
                    : "Every checklist item is completed. Don't panic."}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h5" sx={{ mt: 1 }}>
                  {openTasks.length} {openTasks.length === 1 ? "item" : "items"}{" "}
                  remaining
                </Typography>
                <List dense disablePadding sx={{ mt: 1 }}>
                  {previewTasks.map((task) => (
                    <ListItem key={task.id} disableGutters>
                      <ListItemText
                        primary={task.title}
                        slotProps={{ primary: { noWrap: true } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            <Button
              component={RouterLink}
              to="/tasks"
              size="small"
              sx={{ mt: 2, px: 0 }}
            >
              View all checklist items →
            </Button>
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
