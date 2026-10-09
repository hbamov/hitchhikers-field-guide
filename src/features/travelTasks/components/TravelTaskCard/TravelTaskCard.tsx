import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import type { TravelTask } from "../../types/travelTask.types";

interface TravelTaskCardProps {
  task: TravelTask;
  onToggleStatus: (task: TravelTask) => void;
  onEdit: (task: TravelTask) => void;
  onDelete: (task: TravelTask) => void;
  busy?: boolean;
}

export function TravelTaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  busy = false,
}: TravelTaskCardProps) {
  const isCompleted = task.status === "completed";

  return (
    <Card variant="outlined" sx={{ opacity: isCompleted ? 0.85 : 1 }}>
      <CardContent>
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Checkbox
                checked={isCompleted}
                onChange={() => onToggleStatus(task)}
                disabled={busy}
                inputProps={{
                  "aria-label": isCompleted
                    ? "Mark as open"
                    : "Mark as completed",
                }}
              />
              <Typography
                variant="h6"
                sx={{ textDecoration: isCompleted ? "line-through" : "none" }}
              >
                {task.title}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={() => onEdit(task)} disabled={busy}>
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => onDelete(task)}
                disabled={busy}
              >
                Delete
              </Button>
            </Stack>
          </Stack>

          {task.description ? (
            <Typography color="text.secondary">{task.description}</Typography>
          ) : null}

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              label={isCompleted ? "Completed" : "Open"}
              color={isCompleted ? "success" : "default"}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Priority: ${task.priority}`}
              variant="outlined"
            />
            {task.dueDate ? (
              <Chip
                size="small"
                label={`Due: ${task.dueDate.toLocaleDateString()}`}
                variant="outlined"
              />
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
