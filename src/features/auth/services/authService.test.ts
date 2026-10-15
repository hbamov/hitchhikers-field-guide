import { beforeEach, describe, expect, it, vi } from "vitest";

const firebase = vi.hoisted(() => ({
  auth: {} as object | null,
  db: {} as object | null,
}));

vi.mock("../../../shared/firebase/firebase", () => ({
  get auth() {
    return firebase.auth;
  },
  get db() {
    return firebase.db;
  },
}));
vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db, name, id) => ({ doc: `${name}/${id}` })),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => "SERVER_TS"),
  setDoc: vi.fn(),
}));

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getDoc, setDoc } from "firebase/firestore";
import {
  getAppUser,
  registerAccount,
  resetPassword,
  signIn,
  signOut,
} from "./authService";

const notConfigured = "Firebase is not configured. Add your Firebase values to .env.local.";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebase.auth = {};
    firebase.db = {};
  });

  it("signs in with email and password", async () => {
    await signIn("a@b.dev", "secret1");

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(firebase.auth, "a@b.dev", "secret1");
  });

  it("registers an account, sets the display name and creates a traveler profile", async () => {
    const user = { uid: "u1" };
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user } as never);

    await registerAccount("Arthur", "a@b.dev", "secret1");

    expect(updateProfile).toHaveBeenCalledWith(user, { displayName: "Arthur" });
    expect(setDoc).toHaveBeenCalledWith(
      { doc: "users/u1" },
      {
        email: "a@b.dev",
        displayName: "Arthur",
        role: "traveler",
        createdAt: "SERVER_TS",
        updatedAt: "SERVER_TS",
      },
    );
  });

  it("sends a password reset email", async () => {
    await resetPassword("a@b.dev");

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(firebase.auth, "a@b.dev");
  });

  it("signs out of Firebase", async () => {
    await signOut();

    expect(firebaseSignOut).toHaveBeenCalledWith(firebase.auth);
  });

  it.each([
    ["signIn", () => signIn("a", "b")],
    ["registerAccount", () => registerAccount("n", "a", "b")],
    ["resetPassword", () => resetPassword("a")],
    ["signOut", () => signOut()],
    ["getAppUser", () => getAppUser({ uid: "u1" } as User)],
  ])("%s fails with a clear message when Firebase is not configured", async (_name, action) => {
    firebase.auth = null;
    firebase.db = null;

    await expect(action()).rejects.toThrow(notConfigured);
  });

  describe("getAppUser", () => {
    const firebaseUser = { uid: "u1", email: "a@b.dev", displayName: "Auth Name" } as User;

    it("combines the Firebase user with the stored profile", async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ displayName: "Profile Name", role: "administrator" }),
      } as never);

      await expect(getAppUser(firebaseUser)).resolves.toEqual({
        uid: "u1",
        email: "a@b.dev",
        displayName: "Profile Name",
        role: "administrator",
      });
    });

    it("falls back to the auth display name and the traveler role", async () => {
      vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => ({}) } as never);

      await expect(getAppUser(firebaseUser)).resolves.toMatchObject({
        displayName: "Auth Name",
        role: "traveler",
      });
    });

    it("falls back to 'Traveler' and an empty email when nothing is known", async () => {
      vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => ({}) } as never);

      await expect(getAppUser({ uid: "u1", email: null, displayName: null } as User)).resolves.toMatchObject({
        email: "",
        displayName: "Traveler",
      });
    });

    it("fails when the profile document is missing", async () => {
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);

      await expect(getAppUser(firebaseUser)).rejects.toThrow("Your account profile is missing.");
    });
  });
});
