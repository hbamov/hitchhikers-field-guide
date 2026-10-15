import { Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { notFoundMessages } from "./messages/notFoundMessages";

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
        {notFoundMessages.title}
      </Typography>
      <Typography variant="h2" component="h1">
        {notFoundMessages.subTitle}
      </Typography>
      <Typography color="text.secondary">
        {notFoundMessages.description}
      </Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained">
        {notFoundMessages.returnToDashboard}
      </Button>
    </Stack>
  );
}
