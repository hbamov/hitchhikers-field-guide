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
import { guideCategoryIconMap } from "../../features/guide/utils/guideCategoryIcon";
import { ShieldAlert, Sparkles } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useTravelTasks } from "../../features/travelTasks/hooks/useTravelTasks";
import { useGuideEntries } from "../../features/guide/hooks/useGuideEntries";
import { selectFeaturedGuideEntry } from "../../features/guide/utils/selectFeaturedGuideEntry";
import { dashboardMessages } from "./dashboardMessages";
import type { GuideClassification } from "../../features/guide/types/guide.types";

const PREVIEW_LIMIT = 3;

const classificationLabels: Record<GuideClassification, string> = {
  "mostly-harmless": "MOSTLY HARMLESS",
  safe: "SAFE",
  caution: "CAUTION ADVISED",
  dangerous: "DANGEROUS",
  legendary: "LEGENDARY",
  unknown: "UNKNOWN",
};

export function DashboardPage() {
  const { user } = useAuth();

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useTravelTasks(user?.uid);
  const {
    data: guideEntries = [],
    isLoading: guideLoading,
    isError: guideError,
  } = useGuideEntries();

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status === "open"),
    [tasks],
  );

  const previewTasks = openTasks.slice(0, PREVIEW_LIMIT);
  const featuredEntry = useMemo(
    () => selectFeaturedGuideEntry(guideEntries),
    [guideEntries],
  );

  const FeaturedCategoryIcon = featuredEntry
    ? guideCategoryIconMap[featuredEntry.category]
    : null;

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
        {/* Featured Destination */}
        {/* Featured Destination */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              color="secondary.main"
            >
              {FeaturedCategoryIcon ? <FeaturedCategoryIcon size={18} /> : null}
              <Typography variant="overline">
                {dashboardMessages.featuredDestination}
              </Typography>
            </Stack>

            {guideLoading ? (
              <Stack spacing={1} sx={{ mt: 1.5 }} aria-busy="true">
                <Skeleton variant="rounded" height={32} width="60%" />
                <Skeleton variant="rounded" height={20} />
                <Skeleton variant="rounded" height={20} width="80%" />
              </Stack>
            ) : guideError ? (
              <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                We couldn’t load featured Guide data right now.
              </Typography>
            ) : featuredEntry ? (
              <>
                <Typography variant="h5" sx={{ mt: 1 }}>
                  {featuredEntry.name}
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {featuredEntry.summary}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 2 }}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    size="small"
                    label={`CLASSIFICATION: ${classificationLabels[featuredEntry.classification]}`}
                    color="secondary"
                    variant="outlined"
                  />
                  {featuredEntry.tags[0] ? (
                    <Chip
                      size="small"
                      label={`TAG: ${featuredEntry.tags[0].toLowerCase()}`}
                      variant="outlined"
                    />
                  ) : null}
                </Stack>

                <Button
                  component={RouterLink}
                  to={`/guide/${featuredEntry.id}`}
                  size="small"
                  sx={{ mt: 2, px: 0 }}
                >
                  View full entry →
                </Button>
              </>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                No Guide entries available yet.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Checklist Preview */}
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

            {tasksLoading ? (
              <Stack spacing={1} sx={{ mt: 1.5 }} aria-busy="true">
                <Skeleton variant="rounded" height={32} width="60%" />
                <Skeleton variant="rounded" height={20} />
                <Skeleton variant="rounded" height={20} width="80%" />
              </Stack>
            ) : tasksError ? (
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
                      <ListItemText primary={task.title} />
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
