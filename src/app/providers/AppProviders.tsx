import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClientProvider } from "@tanstack/react-query";
import { theme } from "../theme/theme";
import { AuthProvider } from "../../features/auth/context/AuthContext";
import { queryClient } from "../../lib/queryClient";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
