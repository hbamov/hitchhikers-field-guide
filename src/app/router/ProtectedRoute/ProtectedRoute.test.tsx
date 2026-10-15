import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../../../features/auth/context/AuthContext";

vi.mock("../../features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function mockAuth(overrides: Record<string, unknown> = {}) {
  mockedUseAuth.mockReturnValue({
    user: null,
    loading: false,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useAuth>);
}

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Secret content</div>} />
        </Route>
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading indicator while auth state resolves", () => {
    mockAuth({ loading: true });

    renderProtectedRoute();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to the login page", () => {
    mockAuth();

    renderProtectedRoute();

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("renders the outlet for authenticated users", () => {
    mockAuth({
      user: {
        uid: "1",
        email: "arthur@dent.dev",
        displayName: "Arthur Dent",
        role: "traveler",
      },
    });

    renderProtectedRoute();

    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("shows an error alert when the profile fails to load", () => {
    mockAuth({
      user: {
        uid: "1",
        email: "arthur@dent.dev",
        displayName: "Arthur Dent",
        role: "traveler",
      },
      error: "Your profile could not be read. Check the Firestore rules.",
    });

    renderProtectedRoute();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your profile could not be read. Check the Firestore rules.",
    );
  });
});
