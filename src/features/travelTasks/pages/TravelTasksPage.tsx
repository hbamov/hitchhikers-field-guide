import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Plus } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { useTravelTasks } from "../hooks/useTravelTasks";
import { useUpdateTravelTask } from "../hooks/useUpdateTravelTask";
import { TravelTaskCard } from "../components/TravelTaskCard/TravelTaskCard";
import { CreateTravelTaskDialog } from "../components/CreateTravelTaskDialog/CreateTravelTaskDialog";
import { EditTravelTaskDialog } from "../components/EditTravelTaskDialog/EditTravelTaskDialog";
import { DeleteTaskDialog } from "../components/DeleteTaskDialog/DeleteTaskDialog";
import type { TaskStatus, TravelTask } from "../types/travelTask.types";
import TravelTaskSummary from "../components/TravelTaskSummary/TravelTaskSummary";

type StatusFilter = "all" | TaskStatus;

export function TravelTasksPage() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TravelTask | null>(null);
  const [deletingTask, setDeletingTask] = useState<TravelTask | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const {
    data: tasks = [],
    isLoading,
    isError,
    refetch,
  } = useTravelTasks(user?.uid);
  const updateTaskMutation = useUpdateTravelTask(user?.uid);

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  const counts = useMemo(
    () => ({
      open: tasks.filter((task) => task.status === "open").length,
      completed: tasks.filter((task) => task.status === "completed").length,
      highPriorityOpen: tasks.filter(
        (task) => task.status === "open" && task.priority === "high",
      ).length,
    }),
    [tasks],
  );

  async function handleToggleStatus(task: TravelTask) {
    const nextStatus: TaskStatus =
      task.status === "open" ? "completed" : "open";

    try {
      await updateTaskMutation.mutateAsync({
        taskId: task.id,
        input: {
          status: nextStatus,
          completedAt: nextStatus === "completed" ? new Date() : null,
        },
      });
    } catch {
      // TODO Option al: show snackbar/toast later
    }
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography
          variant="overline"
          color="secondary.main"
          sx={{ letterSpacing: ".16em" }}
        >
          Expedition checklist
        </Typography>
        <Typography variant="h3" component="h1">
          Travel Tasks
        </Typography>
        <Typography color="text.secondary">
          Track what you need before your next jump through the galaxy.
        </Typography>
      </Stack>

      <Button
        variant="contained"
        startIcon={<Plus size={16} />}
        onClick={() => setCreateOpen(true)}
        sx={{ alignSelf: "flex-start" }}
      >
        Add checklist item
      </Button>

      {!isLoading && !isError && tasks.length > 0 ? (
        <TravelTaskSummary
          openCount={counts.open}
          completedCount={counts.completed}
          highPriorityOpenCount={counts.highPriorityOpen}
        />
      ) : null}

      <ToggleButtonGroup
        value={statusFilter}
        exclusive
        onChange={(_, next: StatusFilter | null) => {
          if (next) setStatusFilter(next);
        }}
        size="small"
        aria-label="Task status filter"
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="open">Open</ToggleButton>
        <ToggleButton value="completed">Completed</ToggleButton>
      </ToggleButtonGroup>

      {isLoading ? (
        <Card>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={22} />
            <Typography>Loading checklist items…</Typography>
          </CardContent>
        </Card>
      ) : isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Try again
            </Button>
          }
        >
          We couldn’t load your checklist right now. Please try again.
        </Alert>
      ) : filteredTasks.length === 0 ? (
        <Alert severity="info">
          {tasks.length === 0
            ? "Your checklist is empty. Add your first item to start planning the journey."
            : "No items match this filter."}
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {filteredTasks.map((task) => (
            <TravelTaskCard
              key={task.id}
              task={task}
              onToggleStatus={handleToggleStatus}
              onEdit={setEditingTask}
              onDelete={setDeletingTask}
              busy={updateTaskMutation.isPending}
            />
          ))}
        </Stack>
      )}

      <CreateTravelTaskDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        userId={user?.uid}
      />

      <EditTravelTaskDialog
        open={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        userId={user?.uid}
        task={editingTask}
      />

      <DeleteTaskDialog
        open={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        userId={user?.uid}
        task={deletingTask}
      />
    </Stack>
  );
}
