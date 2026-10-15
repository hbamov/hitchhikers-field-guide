import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAppUser } from "../../test/factories";
import { useAuth } from "../../features/auth/context/AuthContext";
import { AppRouter } from "./AppRouter";

vi.mock("../../features/auth/context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../../components/layout/AppLayout", async () => {
  const { Outlet } = await import("react-router-dom");
  return { AppLayout: () => <Outlet /> };
});
vi.mock("../../pages/Dashboard/DashboardPage", () => ({
  DashboardPage: () => <h1>Dashboard page</h1>,
}));
vi.mock("../../features/auth/pages/AuthPage", () => ({
  AuthPage: ({ mode }: { mode: string }) => <h1>Auth page: {mode}</h1>,
}));
vi.mock("../../features/adminGuide/pages/AdminGuidePage", () => ({
  AdminGuidePage: () => <h1>Admin guide page</h1>,
}));
vi.mock("../../features/guide/pages/GuidePage", () => ({
  GuidePage: () => <h1>Guide page</h1>,
}));
vi.mock("../../features/guide/pages/GuideEntryPage", () => ({
  GuideEntryPage: () => <h1>Guide entry page</h1>,
}));
vi.mock("../../features/travelTasks/pages/TravelTasksPage", () => ({
  TravelTasksPage: () => <h1>Tasks page</h1>,
}));

function mockAuth(role: "traveler" | "administrator" | null) {
  vi.mocked(useAuth).mockReturnValue({
    user: role ? makeAppUser({ role }) : null,
    loading: false,
    error: null,
  } as unknown as ReturnType<typeof useAuth>);
}

function renderAt(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppRouter />
    </MemoryRouter>,
  );
}

describe("AppRouter", () => {
  beforeEach(() => vi.resetAllMocks());

  it("redirects the root path to the dashboard for a signed-in user", () => {
    mockAuth("traveler");
    renderAt("/");
    expect(screen.getByRole("heading", { name: "Dashboard page" })).toBeInTheDocument();
  });

  it("sends signed-out visitors to the login page when they open a protected route", () => {
    mockAuth(null);
    renderAt("/tasks");
    expect(screen.getByRole("heading", { name: "Auth page: login" })).toBeInTheDocument();
  });

  it("serves the register page to signed-out visitors", () => {
    mockAuth(null);
    renderAt("/register");
    expect(screen.getByRole("heading", { name: "Auth page: register" })).toBeInTheDocument();
  });

  it("redirects signed-in users away from the login page", () => {
    mockAuth("traveler");
    renderAt("/login");
    expect(screen.queryByRole("heading", { name: /Auth page/ })).not.toBeInTheDocument();
  });

  it.each([
    ["/guide", "Guide page"],
    ["/guide/earth", "Guide entry page"],
    ["/tasks", "Tasks page"],
  ])("renders %s for a signed-in user", (route, heading) => {
    mockAuth("traveler");
    renderAt(route);
    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
  });

  it("lets administrators open the admin guide but not travelers", () => {
    mockAuth("administrator");
    const admin = renderAt("/admin/guide");
    expect(screen.getByRole("heading", { name: "Admin guide page" })).toBeInTheDocument();
    admin.unmount();

    mockAuth("traveler");
    renderAt("/admin/guide");
    expect(screen.queryByRole("heading", { name: "Admin guide page" })).not.toBeInTheDocument();
  });

  it("shows the not-found page for unknown routes", () => {
    mockAuth("traveler");
    renderAt("/nowhere");
    expect(screen.queryByRole("heading", { name: "Dashboard page" })).not.toBeInTheDocument();
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
