import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { CalendarDays, Flag, Trash2, Pencil } from "lucide-react";
import type { TravelTask } from "../../types/travelTask.types";
import { COMPLETED_COLOR, getPriorityMeta } from "../../utils/priority";

interface TravelTaskCardProps {
  task: TravelTask;
  onToggleStatus: (task: TravelTask) => void;
  onEdit: (task: TravelTask) => void;
  onDelete: (task: TravelTask) => void;
  busy?: boolean;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDueDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TravelTaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  busy = false,
}: TravelTaskCardProps) {
  const isCompleted = task.status === "completed";
  const priority = getPriorityMeta(task.priority);
  const accent = isCompleted ? COMPLETED_COLOR : priority.color;

  const due = task.dueDate instanceof Date ? task.dueDate : null;
  const overdue = !isCompleted && due !== null && due < startOfToday();

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${accent}`,
        bgcolor: isCompleted ? "transparent" : alpha(accent, 0.06),
        opacity: isCompleted ? 0.8 : 1,
        transition: "background-color 200ms ease, border-color 200ms ease",
        "&:hover": { bgcolor: alpha(accent, isCompleted ? 0.04 : 0.1) },
      }}
    >
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
              sx={{
                color: accent,
                "&.Mui-checked": { color: accent },
              }}
              inputProps={{
                "aria-label": isCompleted
                  ? "Mark as open"
                  : "Mark as completed",
              }}
            />

            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  textDecoration: isCompleted ? "line-through" : "none",
                  color: isCompleted ? "text.secondary" : "text.primary",
                  overflowWrap: "anywhere",
                }}
              >
                {task.title}
              </Typography>

              <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                <Chip
                  size="small"
                  icon={<Flag size={13} />}
                  label={priority.label}
                  sx={{
                    fontWeight: 600,
                    color: accent,
                    bgcolor: alpha(accent, 0.14),
                    border: `1px solid ${alpha(accent, 0.4)}`,
                    "& .MuiChip-icon": { color: "inherit" },
                  }}
                />
                {due ? (
                  <Chip
                    size="small"
                    icon={<CalendarDays size={13} />}
                    label={
                      overdue
                        ? `Overdue · ${formatDueDate(due)}`
                        : `Due ${formatDueDate(due)}`
                    }
                    sx={{
                      fontWeight: 600,
                      color: overdue ? "#ef5350" : "text.secondary",
                      bgcolor: overdue ? alpha("#ef5350", 0.14) : "transparent",
                      border: `1px solid ${
                        overdue
                          ? alpha("#ef5350", 0.4)
                          : "rgba(255,255,255,.16)"
                      }`,
                      "& .MuiChip-icon": { color: "inherit" },
                    }}
                  />
                ) : null}
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => onEdit(task)}
              variant="outlined"
              size="small"
              startIcon={<Pencil size={14} />}
              sx={{
                borderColor: "warning.main",
                color: "warning.main",
                "&:hover": {
                  borderColor: "warning.light",
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
                },
              }}
            >
              Edit
            </Button>
            <Button
              onClick={() => onDelete(task)}
              variant="outlined"
              size="small"
              startIcon={<Trash2 size={14} />}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": {
                  borderColor: "error.light",
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
                },
              }}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
