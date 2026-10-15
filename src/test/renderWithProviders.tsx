import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { theme } from "../app/theme/theme";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

interface Options extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  /** Route pattern to mount the UI on (needed for useParams). */
  path?: string;
  queryClient?: QueryClient;
}

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", path, queryClient, ...options }: Options = {},
) {
  const client = queryClient ?? createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={[route]}>
            {path ? (
              <Routes>
                <Route path={path} element={children} />
                <Route path="*" element={<LocationDisplay />} />
              </Routes>
            ) : (
              children
            )}
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  return { queryClient: client, ...render(ui, { wrapper: Wrapper, ...options }) };
}
