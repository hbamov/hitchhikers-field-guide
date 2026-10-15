import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuestRoute } from "./GuestRoute";
import { useAuth } from "../../../features/auth/context/AuthContext";

vi.mock("../../features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function mockAuth(overrides: Record<string, unknown> = {}) {
  mockedUseAuth.mockReturnValue({
    user: null,
    loading: false,
    ...overrides,
  } as unknown as ReturnType<typeof useAuth>);
}

function renderGuestRoute() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<div>Login form</div>} />
        </Route>
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("GuestRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing while auth state resolves", () => {
    mockAuth({ loading: true });

    renderGuestRoute();

    expect(screen.queryByText("Login form")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("renders the outlet for guests", () => {
    mockAuth();

    renderGuestRoute();

    expect(screen.getByText("Login form")).toBeInTheDocument();
  });

  it("redirects authenticated users to the dashboard", () => {
    mockAuth({
      user: {
        uid: "1",
        email: "arthur@dent.dev",
        displayName: "Arthur Dent",
        role: "traveler",
      },
    });

    renderGuestRoute();

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Login form")).not.toBeInTheDocument();
  });
});
