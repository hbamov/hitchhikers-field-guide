import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { TravelTask } from "../../types/travelTask.types";

interface TravelTaskCardProps {
  task: TravelTask;
}

export function TravelTaskCard({ task }: TravelTaskCardProps) {
  const isCompleted = task.status === "completed";

  return (
    <Card
      variant="outlined"
      sx={{
        opacity: isCompleted ? 0.85 : 1,
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography
            variant="h6"
            sx={{
              textDecoration: isCompleted ? "line-through" : "none",
            }}
          >
            {task.title}
          </Typography>

          {task.description ? (
            <Typography color="text.secondary">{task.description}</Typography>
          ) : null}

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              label={task.status === "open" ? "Open" : "Completed"}
              color={task.status === "open" ? "default" : "success"}
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
