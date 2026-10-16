import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
  alpha,
  LinearProgress,
} from "@mui/material";
import {
  ShieldAlert,
  Sparkles,
  MessagesSquare,
  CalendarDays,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useTravelTasks } from "../../features/travelTasks/hooks/useTravelTasks";
import { useGuideEntries } from "../../features/guide/hooks/useGuideEntries";
import { selectFeaturedGuideEntry } from "../../features/guide/utils/selectFeaturedGuideEntry";
import { dashboardMessages } from "./messages/dashboardMessages";
import { useLoungeChat } from "../../features/loungeChat/context/LoungeChatContext";
import { LOUNGE_NAME } from "../../features/loungeChat/components/LoungeChatDock/LoungeChatDock";
import {
  getCategoryMeta,
  getClassificationMeta,
} from "../../features/guide/utils/guideDisplay";

const PREVIEW_LIMIT = 3;
const PRIORITY_META = {
  high: { label: "High priority", color: "#ef5350" },
  medium: { label: "Medium priority", color: "#ffb300" },
  low: { label: "Low priority", color: "#4caf8a" },
} as const;

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

  const featuredCategory = featuredEntry
    ? getCategoryMeta(featuredEntry.category)
    : null;
  const featuredClassification = featuredEntry
    ? getClassificationMeta(featuredEntry.classification)
    : null;
  const FeaturedCategoryIcon = featuredCategory?.icon ?? null;

  const {
    messages: chatMessages,
    status: chatStatus,
    unreadCount,
    open: openChat,
  } = useLoungeChat();

  const latestMessages = chatMessages.slice(-3);

  const startOfToday = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const formatDueDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const completedCount = tasks.length - openTasks.length;
  const progress =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const today = startOfToday();

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
        {/* Featured destination */}
        <Card
          sx={{
            ...(featuredClassification
              ? { borderLeft: `4px solid ${featuredClassification.color}` }
              : null),
          }}
        >
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
            ) : featuredEntry && featuredCategory && featuredClassification ? (
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
                    label={featuredClassification.label}
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                      color: featuredClassification.color,
                      bgcolor: alpha(featuredClassification.color, 0.14),
                      border: `1px solid ${alpha(featuredClassification.color, 0.45)}`,
                    }}
                  />
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

        {/* Checklist preview */}
        {/* Checklist Preview */}
        <Card sx={{ borderTop: "3px solid", borderTopColor: "primary.main" }}>
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
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

              {!tasksLoading && !tasksError && tasks.length > 0 ? (
                <Chip
                  size="small"
                  label={`${completedCount} of ${tasks.length} done`}
                  sx={{
                    fontWeight: 600,
                    color: "primary.main",
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                  }}
                />
              ) : null}
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

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  aria-label="Checklist progress"
                  sx={{ mt: 1.5, height: 6, borderRadius: 3 }}
                />

                <Stack
                  component="ul"
                  spacing={0.75}
                  sx={{ mt: 2, p: 0, listStyle: "none" }}
                >
                  {previewTasks.map((task) => {
                    const priority =
                      PRIORITY_META[task.priority] ?? PRIORITY_META.medium;
                    const due =
                      task.dueDate instanceof Date ? task.dueDate : null;
                    const overdue = due !== null && due < today;

                    return (
                      <Box
                        component="li"
                        key={task.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          bgcolor: "action.hover",
                          borderLeft: `3px solid ${priority.color}`,
                        }}
                      >
                        <Box
                          role="img"
                          aria-label={priority.label}
                          sx={{
                            width: 8,
                            height: 8,
                            flexShrink: 0,
                            borderRadius: "50%",
                            bgcolor: priority.color,
                          }}
                        />
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ flexGrow: 1, minWidth: 0 }}
                        >
                          {task.title}
                        </Typography>
                        {due ? (
                          <Chip
                            size="small"
                            icon={<CalendarDays size={13} />}
                            label={
                              overdue
                                ? `Overdue · ${formatDueDate(due)}`
                                : formatDueDate(due)
                            }
                            sx={{
                              flexShrink: 0,
                              fontWeight: 600,
                              color: overdue ? "#ef5350" : "text.secondary",
                              bgcolor: overdue
                                ? alpha("#ef5350", 0.14)
                                : "transparent",
                              border: `1px solid ${overdue ? alpha("#ef5350", 0.4) : "rgba(255,255,255,.16)"}`,
                              "& .MuiChip-icon": { color: "inherit" },
                            }}
                          />
                        ) : null}
                      </Box>
                    );
                  })}
                </Stack>
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

        {/* Live lounge card */}
        <Card
          sx={{
            gridColumn: "1 / -1",
            borderTop: "3px solid",
            borderTopColor: "secondary.main",
          }}
        >
          <CardActionArea onClick={openChat} aria-label="Open the lounge chat">
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                color="secondary.main"
              >
                <MessagesSquare size={20} />
                <Typography variant="overline">{LOUNGE_NAME}</Typography>
                <Chip
                  size="small"
                  color="success"
                  variant="outlined"
                  label="LIVE"
                />
                {unreadCount > 0 ? (
                  <Chip
                    size="small"
                    color="secondary"
                    label={`${unreadCount} new`}
                  />
                ) : null}
              </Stack>

              {chatStatus === "loading" ? (
                <Stack spacing={1} sx={{ mt: 1.5 }} aria-busy="true">
                  <Skeleton variant="rounded" height={20} />
                  <Skeleton variant="rounded" height={20} width="70%" />
                </Stack>
              ) : chatStatus === "error" ? (
                <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                  We couldn’t reach the lounge right now.
                </Typography>
              ) : latestMessages.length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                  Nobody has said anything yet. Click to start the conversation.
                </Typography>
              ) : (
                <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                  {latestMessages.map((message) => (
                    <Typography key={message.id} variant="body2" noWrap>
                      <Box
                        component="span"
                        sx={{ color: "secondary.main", fontWeight: 600 }}
                      >
                        {message.displayName}:
                      </Box>{" "}
                      {message.text}
                    </Typography>
                  ))}
                </Stack>
              )}

              <Typography
                variant="caption"
                color="primary.main"
                sx={{ display: "block", mt: 2 }}
              >
                Join the conversation →
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>

      <Typography variant="caption" color="text.secondary">
        {dashboardMessages.accountSummary(user?.email || "Unknown")}
      </Typography>
    </Stack>
  );
}
