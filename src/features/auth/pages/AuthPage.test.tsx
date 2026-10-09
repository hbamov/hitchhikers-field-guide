import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthPage } from "./AuthPage";
import { useAuth } from "../context/AuthContext";

vi.mock("../../../shared/firebase/firebase", () => ({
  isFirebaseConfigured: true,
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function mockAuth(overrides: Record<string, unknown> = {}) {
  const value = {
    user: null,
    loading: false,
    error: null,
    firebaseConfigured: true,
    signInWithEmail: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    sendPasswordReset: vi.fn().mockResolvedValue(undefined),
    signOutUser: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  mockedUseAuth.mockReturnValue(value as unknown as ReturnType<typeof useAuth>);
  return value;
}

function renderAuthPage(mode: "login" | "register") {
  const path = mode === "login" ? "/login" : "/register";
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AuthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form without a name field", () => {
    mockAuth();

    renderAuthPage("login");

    expect(screen.getByText("Welcome aboard")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Forgot password?" }),
    ).toBeInTheDocument();
  });

  it("renders the register form with a name field", () => {
    mockAuth();

    renderAuthPage("register");

    expect(screen.getByText("Join the next expedition")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    mockAuth();

    renderAuthPage("login");

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
  });

  it("signs in and navigates to the dashboard", async () => {
    const user = userEvent.setup();
    const auth = mockAuth();

    renderAuthPage("login");

    await user.type(screen.getByLabelText("Email"), "arthur@dent.dev");
    await user.type(screen.getByLabelText("Password"), "towel42");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(auth.signInWithEmail).toHaveBeenCalledWith(
        "arthur@dent.dev",
        "towel42",
      ),
    );
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  it("creates an account and navigates to the dashboard", async () => {
    const user = userEvent.setup();
    const auth = mockAuth();

    renderAuthPage("register");

    await user.type(screen.getByLabelText("Name"), "Arthur Dent");
    await user.type(screen.getByLabelText("Email"), "arthur@dent.dev");
    await user.type(screen.getByLabelText("Password"), "towel42");
    await user.click(
      screen.getByRole("button", { name: "Create traveler account" }),
    );

    await waitFor(() =>
      expect(auth.register).toHaveBeenCalledWith(
        "Arthur Dent",
        "arthur@dent.dev",
        "towel42",
      ),
    );
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  it("shows an error alert when sign in fails", async () => {
    const user = userEvent.setup();
    mockAuth({
      signInWithEmail: vi
        .fn()
        .mockRejectedValue(new Error("Email or password is incorrect.")),
    });

    renderAuthPage("login");

    await user.type(screen.getByLabelText("Email"), "arthur@dent.dev");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email or password is incorrect.",
    );
  });
});
