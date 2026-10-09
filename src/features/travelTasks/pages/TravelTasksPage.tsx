import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useAuth } from "../../auth/context/AuthContext";
import { useTravelTasks } from "../hooks/useTravelTasks";

export function TravelTasksPage() {
  const { user } = useAuth();

  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTravelTasks(user?.uid);

  console.info("Debug Error:", error);

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
      ) : tasks.length === 0 ? (
        <Alert severity="info">
          Your checklist is empty. Add your first item to start planning the
          journey.
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {tasks.map((task) => (
            <Card key={task.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{task.title}</Typography>
                {task.description ? (
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {task.description}
                  </Typography>
                ) : null}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {task.status.toUpperCase()} · {task.priority.toUpperCase()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
