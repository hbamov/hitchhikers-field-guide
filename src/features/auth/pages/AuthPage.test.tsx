import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthPage } from "./AuthPage";
import { useAuth } from "../context/AuthContext";

const firebase = vi.hoisted(() => ({ isFirebaseConfigured: true }));

vi.mock("../../../shared/firebase/firebase", () => ({
  get isFirebaseConfigured() {
    return firebase.isFirebaseConfigured;
  },
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

function renderAuthPage(mode: "login" | "register", state?: unknown) {
  const path = mode === "login" ? "/login" : "/register";
  return render(
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/tasks" element={<div>Checklist page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AuthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebase.isFirebaseConfigured = true;
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

  it("shows a generic error and never the raw error message when sign in fails", async () => {
    const user = userEvent.setup();
    mockAuth({
      signInWithEmail: vi
        .fn()
        .mockRejectedValue(new Error("Firebase: Error (auth/internal-error)")),
    });

    renderAuthPage("login");

    await user.type(screen.getByLabelText("Email"), "arthur@dent.dev");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Unable to continue. Please try again.");
    expect(alert).not.toHaveTextContent("Firebase");
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("returns to the page the visitor originally asked for after signing in", async () => {
    const user = userEvent.setup();
    mockAuth();

    renderAuthPage("login", { from: { pathname: "/tasks" } });

    await user.type(screen.getByLabelText("Email"), "arthur@dent.dev");
    await user.type(screen.getByLabelText("Password"), "towel42");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Checklist page")).toBeInTheDocument();
  });

  it("rejects a malformed email without calling the sign-in service", async () => {
    const user = userEvent.setup();
    const auth = mockAuth();

    renderAuthPage("login");

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "towel42");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(auth.signInWithEmail).not.toHaveBeenCalled();
  });

  it("requires a password of at least 6 characters when registering", async () => {
    const user = userEvent.setup();
    const auth = mockAuth();

    renderAuthPage("register");

    await user.type(screen.getByLabelText("Name"), "Arthur Dent");
    await user.type(screen.getByLabelText("Email"), "arthur@dent.dev");
    await user.type(screen.getByLabelText("Password"), "12345");
    await user.click(screen.getByRole("button", { name: "Create traveler account" }));

    expect(await screen.findByText("Use at least 6 characters.")).toBeInTheDocument();
    expect(auth.register).not.toHaveBeenCalled();
  });

  it("requires a name when registering", async () => {
    const user = userEvent.setup();
    const auth = mockAuth();

    renderAuthPage("register");

    await user.type(screen.getByLabelText("Name"), " A ");
    await user.type(screen.getByLabelText("Email"), "arthur@dent.dev");
    await user.type(screen.getByLabelText("Password"), "towel42");
    await user.click(screen.getByRole("button", { name: "Create traveler account" }));

    expect(await screen.findByText("Enter at least 2 characters.")).toBeInTheDocument();
    expect(auth.register).not.toHaveBeenCalled();
  });

  it("shows a generic error when registration fails", async () => {
    const user = userEvent.setup();
    mockAuth({ register: vi.fn().mockRejectedValue(new Error("auth/email-already-in-use raw")) });

    renderAuthPage("register");

    await user.type(screen.getByLabelText("Name"), "Arthur Dent");
    await user.type(screen.getByLabelText("Email"), "arthur@dent.dev");
    await user.type(screen.getByLabelText("Password"), "towel42");
    await user.click(screen.getByRole("button", { name: "Create traveler account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to continue. Please try again.",
    );
  });

  describe("password reset", () => {
    it("asks for a valid email first and does not send anything", async () => {
      const user = userEvent.setup();
      const auth = mockAuth();

      renderAuthPage("login");

      await user.type(screen.getByLabelText("Email"), "nope");
      await user.click(screen.getByRole("button", { name: "Forgot password?" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Enter your email address first",
      );
      expect(auth.sendPasswordReset).not.toHaveBeenCalled();
    });

    it("sends the reset email and confirms without revealing whether the account exists", async () => {
      const user = userEvent.setup();
      const auth = mockAuth();

      renderAuthPage("login");

      await user.type(screen.getByLabelText("Email"), "arthur@dent.dev");
      await user.click(screen.getByRole("button", { name: "Forgot password?" }));

      expect(await screen.findByRole("status")).toHaveTextContent(
        "If an account exists for that email, a password reset link is on its way.",
      );
      expect(auth.sendPasswordReset).toHaveBeenCalledWith("arthur@dent.dev");
    });

    it("shows an error when the reset email cannot be sent", async () => {
      const user = userEvent.setup();
      mockAuth({ sendPasswordReset: vi.fn().mockRejectedValue(new Error("raw")) });

      renderAuthPage("login");

      await user.type(screen.getByLabelText("Email"), "arthur@dent.dev");
      await user.click(screen.getByRole("button", { name: "Forgot password?" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Could not send reset email.",
      );
    });

    it("is not offered on the register page", () => {
      mockAuth();

      renderAuthPage("register");

      expect(screen.queryByRole("button", { name: "Forgot password?" })).not.toBeInTheDocument();
    });
  });

  it("warns and disables submitting when Firebase is not configured", () => {
    firebase.isFirebaseConfigured = false;
    mockAuth();

    renderAuthPage("login");

    expect(screen.getByText(/Firebase is not configured yet/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Forgot password?" })).toBeDisabled();
  });

  it("links between login and register", () => {
    mockAuth();

    renderAuthPage("login");

    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      "/register",
    );
  });
});
