import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const firebase = vi.hoisted(() => ({
  auth: {} as object | null,
  isFirebaseConfigured: true,
}));

vi.mock("../../../shared/firebase/firebase", () => ({
  get auth() {
    return firebase.auth;
  },
  get isFirebaseConfigured() {
    return firebase.isFirebaseConfigured;
  },
}));
vi.mock("firebase/auth", () => ({ onAuthStateChanged: vi.fn() }));
vi.mock("../services/authService");

import { onAuthStateChanged, type User } from "firebase/auth";
import { makeAppUser } from "../../../test/factories";
import {
  getAppUser,
  registerAccount,
  resetPassword,
  signIn,
  signOut,
} from "../services/authService";
import { AuthProvider, useAuth } from "./AuthContext";

type Listener = (user: User | null) => Promise<void>;

function captureAuthListener() {
  const unsubscribe = vi.fn();
  let listener!: Listener;
  vi.mocked(onAuthStateChanged).mockImplementation(((_auth: unknown, next: Listener) => {
    listener = next;
    return unsubscribe;
  }) as never);
  return {
    unsubscribe,
    emit: (user: User | null) => act(async () => listener(user)),
  };
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const firebaseUser = { uid: "user-1" } as User;

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    firebase.auth = {};
    firebase.isFirebaseConfigured = true;
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("is loading until Firebase reports the auth state", () => {
    captureAuthListener();

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("exposes the app user after a user signs in", async () => {
    const { emit } = captureAuthListener();
    const appUser = makeAppUser({ role: "administrator" });
    vi.mocked(getAppUser).mockResolvedValue(appUser);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await emit(firebaseUser);

    expect(result.current.user).toEqual(appUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("clears the user when the person signs out", async () => {
    const { emit } = captureAuthListener();
    vi.mocked(getAppUser).mockResolvedValue(makeAppUser());
    const { result } = renderHook(() => useAuth(), { wrapper });
    await emit(firebaseUser);

    await emit(null);

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("sets a friendly error and no user when loading the profile fails", async () => {
    const { emit } = captureAuthListener();
    vi.mocked(getAppUser).mockRejectedValue(
      Object.assign(new Error("Missing or insufficient permissions."), {
        code: "permission-denied",
      }),
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await emit(firebaseUser);

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(
      "Your profile could not be read. Check your access permissions.",
    );
    expect(result.current.loading).toBe(false);
  });

  it("never leaks an unknown error message when loading the profile fails", async () => {
    const { emit } = captureAuthListener();
    vi.mocked(getAppUser).mockRejectedValue(new Error("INTERNAL: secret project-id detail"));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await emit(firebaseUser);

    expect(result.current.error).toBe("Something went wrong. Please try again.");
  });

  it("clears an earlier profile error on the next auth change", async () => {
    const { emit } = captureAuthListener();
    vi.mocked(getAppUser).mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await emit(firebaseUser);

    await emit(null);

    expect(result.current.error).toBeNull();
  });

  it("stops loading and subscribes to nothing when Firebase is not configured", async () => {
    firebase.auth = null;
    firebase.isFirebaseConfigured = false;

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.firebaseConfigured).toBe(false);
    expect(onAuthStateChanged).not.toHaveBeenCalled();
  });

  it("unsubscribes from auth changes on unmount", () => {
    const { unsubscribe } = captureAuthListener();
    const { unmount } = renderHook(() => useAuth(), { wrapper });

    unmount();

    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  describe("actions", () => {
    beforeEach(() => captureAuthListener());

    it("passes credentials through to the sign-in service", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(() => result.current.signInWithEmail("a@b.dev", "secret1"));

      expect(signIn).toHaveBeenCalledWith("a@b.dev", "secret1");
    });

    it("passes registration details to the register service", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(() => result.current.register("Arthur", "a@b.dev", "secret1"));

      expect(registerAccount).toHaveBeenCalledWith("Arthur", "a@b.dev", "secret1");
    });

    it("passes the email to the password reset service", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(() => result.current.sendPasswordReset("a@b.dev"));

      expect(resetPassword).toHaveBeenCalledWith("a@b.dev");
    });

    it("signs out through the service", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(() => result.current.signOutUser());

      expect(signOut).toHaveBeenCalledOnce();
    });

    it.each([
      ["auth/invalid-credential", "Email or password is incorrect."],
      ["auth/user-not-found", "No account was found with that email address."],
      ["auth/email-already-in-use", "An account with this email already exists."],
      ["auth/weak-password", "Choose a password with at least 6 characters."],
      ["auth/invalid-email", "Enter a valid email address."],
      ["auth/too-many-requests", "Too many attempts. Wait a moment and try again."],
      ["permission-denied", "Your profile could not be read. Check your access permissions."],
    ])("maps the Firebase code %s to a friendly message", async (code, message) => {
      vi.mocked(signIn).mockRejectedValue(Object.assign(new Error("raw firebase text"), { code }));
      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(result.current.signInWithEmail("a", "b")).rejects.toThrow(
        new Error(message),
      );
    });

    it("uses a generic message for unknown errors and never leaks error.message", async () => {
      const leaky = new Error("Firebase: Error (auth/internal-error). apiKey=abc");
      vi.mocked(signIn).mockRejectedValue(leaky);
      vi.mocked(registerAccount).mockRejectedValue(leaky);
      vi.mocked(resetPassword).mockRejectedValue(leaky);
      vi.mocked(signOut).mockRejectedValue(leaky);
      const { result } = renderHook(() => useAuth(), { wrapper });
      const generic = new Error("Something went wrong. Please try again.");

      await expect(result.current.signInWithEmail("a", "b")).rejects.toThrow(generic);
      await expect(result.current.register("n", "a", "b")).rejects.toThrow(generic);
      await expect(result.current.sendPasswordReset("a")).rejects.toThrow(generic);
      await expect(result.current.signOutUser()).rejects.toThrow(generic);
    });

    it("uses a generic message when the rejected value is not an error object", async () => {
      vi.mocked(signIn).mockRejectedValue(undefined);
      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(result.current.signInWithEmail("a", "b")).rejects.toThrow(
        "Something went wrong. Please try again.",
      );
    });
  });
});

describe("useAuth", () => {
  it("fails with a clear message outside of AuthProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow("useAuth must be used inside AuthProvider");
    expect(screen.queryByText("probe")).not.toBeInTheDocument();
  });
});

function Probe() {
  useAuth();
  return <span>probe</span>;
}
