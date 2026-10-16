import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { CheckCircle2, Flame, ListTodo } from "lucide-react";

interface TravelTaskSummaryProps {
  openCount: number;
  completedCount: number;
  highPriorityOpenCount: number;
}

export default function TravelTaskSummary({
  openCount,
  completedCount,
  highPriorityOpenCount,
}: TravelTaskSummaryProps) {
  const items = [
    {
      label: "Open items",
      value: openCount,
      icon: ListTodo,
      color: "#f2c14e",
    },
    {
      label: "Completed items",
      value: completedCount,
      icon: CheckCircle2,
      color: "#4caf8a",
    },
    {
      label: "High-priority open",
      value: highPriorityOpenCount,
      icon: Flame,
      color: highPriorityOpenCount > 0 ? "#ef5350" : "#78909c",
    },
  ];

  return (
    <Stack
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.label}
            variant="outlined"
            sx={{
              borderTop: `3px solid ${item.color}`,
              bgcolor: alpha(item.color, 0.06),
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Stack spacing={0.25}>
                <Typography
                  variant="h4"
                  component="p"
                  sx={{ fontWeight: 700, color: item.color }}
                >
                  {item.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
              </Stack>

              <Box
                aria-hidden="true"
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 2,
                  color: item.color,
                  bgcolor: alpha(item.color, 0.14),
                  border: `1px solid ${alpha(item.color, 0.35)}`,
                }}
              >
                <Icon size={22} />
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
