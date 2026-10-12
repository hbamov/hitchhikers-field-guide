import { Card, CardContent, Stack, Typography } from "@mui/material";

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
    { label: "Open items", value: openCount },
    { label: "Completed items", value: completedCount },
    { label: "High-priority open", value: highPriorityOpenCount },
  ];

  return (
    <Stack
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
      }}
    >
      {items.map((item) => (
        <Card key={item.label} variant="outlined">
          <CardContent>
            <Typography variant="h4" component="p">
              {item.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
