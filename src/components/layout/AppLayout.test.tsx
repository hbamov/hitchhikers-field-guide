import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppLayout } from "./AppLayout";
import { useAuth } from "../../features/auth/context/AuthContext";

vi.mock("../../features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function mockAuth(overrides: Record<string, unknown> = {}) {
  const value = {
    user: {
      uid: "1",
      email: "arthur@dent.dev",
      displayName: "Arthur Dent",
      role: "traveler",
    },
    loading: false,
    error: null,
    firebaseConfigured: true,
    signOutUser: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  mockedUseAuth.mockReturnValue(value as unknown as ReturnType<typeof useAuth>);
  return value;
}

function renderAppLayout() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<div>Dashboard content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title, navigation, user name, and outlet content", () => {
    mockAuth();

    renderAppLayout();

    expect(
      screen.getByText("The Hitchhiker’s Field Guide"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Guide" })).toBeInTheDocument();
    expect(screen.getByText("Arthur Dent")).toBeInTheDocument();
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
  });

  it("signs out and navigates to the login page", async () => {
    const user = userEvent.setup();
    const auth = mockAuth();

    renderAppLayout();

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(auth.signOutUser).toHaveBeenCalledOnce());
    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });
});
