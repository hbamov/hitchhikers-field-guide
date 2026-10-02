import { Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Stack
      spacing={2}
      sx={{
        minHeight: "70vh",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <Typography variant="overline" color="secondary.main">
        COORDINATES NOT FOUND
      </Typography>
      <Typography variant="h2" component="h1">
        This route is mostly harmless.
      </Typography>
      <Typography color="text.secondary">
        The page you’re looking for is not in this edition of the guide.
      </Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained">
        Return to your dashboard
      </Button>
    </Stack>
  );
}
