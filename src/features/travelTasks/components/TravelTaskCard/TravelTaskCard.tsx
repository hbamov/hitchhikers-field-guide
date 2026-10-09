import {
  Button,
  Card,
  CardContent,
  Checkbox,
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          gap={1}
        >
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ minWidth: 0 }}
          >
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
              sx={{
                textDecoration: isCompleted ? "line-through" : "none",
                overflowWrap: "anywhere",
              }}
            >
              {task.title}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ pl: { xs: 5, sm: 0 } }}>
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
      </CardContent>
    </Card>
  );
}
