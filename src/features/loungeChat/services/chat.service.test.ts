import { beforeEach, describe, expect, it, vi } from "vitest";

const firebase = vi.hoisted(() => ({ db: {} as object | null }));

vi.mock("../../../shared/firebase/firebase", () => ({
  get db() {
    return firebase.db;
  },
}));
vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  collection: vi.fn((_db, name) => ({ collection: name })),
  limit: vi.fn((n) => ({ limit: n })),
  onSnapshot: vi.fn(),
  orderBy: vi.fn((field, dir) => ({ orderBy: [field, dir] })),
  query: vi.fn((...parts) => ({ query: parts })),
  serverTimestamp: vi.fn(() => "SERVER_TS"),
}));

import { addDoc, onSnapshot } from "firebase/firestore";
import { sendChatMessage, subscribeToChatMessages } from "./chat.service";

function messageDoc(id: string, data: Record<string, unknown>) {
  return { id, data: vi.fn(() => data) };
}

describe("chat.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebase.db = {};
  });

  describe("sendChatMessage", () => {
    it("trims the text and stores it with a server timestamp", async () => {
      await sendChatMessage({ userId: "u1", displayName: "Arthur", text: "  hi  " });

      expect(addDoc).toHaveBeenCalledWith(
        { collection: "chatMessages" },
        { userId: "u1", displayName: "Arthur", text: "hi", createdAt: "SERVER_TS" },
      );
    });

    it("falls back to 'Hitchhiker' when the display name is blank", async () => {
      await sendChatMessage({ userId: "u1", displayName: "   ", text: "hi" });

      expect(vi.mocked(addDoc).mock.calls[0][1]).toMatchObject({
        displayName: "Hitchhiker",
      });
    });

    it("limits the display name to 60 characters", async () => {
      await sendChatMessage({ userId: "u1", displayName: "a".repeat(80), text: "hi" });

      expect(vi.mocked(addDoc).mock.calls[0][1]).toMatchObject({
        displayName: "a".repeat(60),
      });
    });

    it.each([
      ["empty", ""],
      ["whitespace-only", "   "],
      ["over 500 characters", "x".repeat(501)],
    ])("rejects %s text without writing", async (_label, text) => {
      await expect(
        sendChatMessage({ userId: "u1", displayName: "A", text }),
      ).rejects.toThrow("Invalid message.");

      expect(addDoc).not.toHaveBeenCalled();
    });

    it("accepts a message of exactly 500 characters", async () => {
      await sendChatMessage({ userId: "u1", displayName: "A", text: "x".repeat(500) });

      expect(addDoc).toHaveBeenCalledOnce();
    });

    it("throws a clear error when Firestore is not initialized", async () => {
      firebase.db = null;

      await expect(
        sendChatMessage({ userId: "u1", displayName: "A", text: "hi" }),
      ).rejects.toThrow("Firebase Firestore is not initialized.");
    });
  });

  describe("subscribeToChatMessages", () => {
    it("delivers messages oldest first even though they are queried newest first", () => {
      const onData = vi.fn();
      vi.mocked(onSnapshot).mockImplementation(((_q: unknown, next: (s: unknown) => void) => {
        next({
          docs: [
            messageDoc("new", { userId: "u2", displayName: "Ford", text: "second", createdAt: { toDate: () => new Date(2000) } }),
            messageDoc("old", { userId: "u1", displayName: "Arthur", text: "first", createdAt: { toDate: () => new Date(1000) } }),
          ],
        });
        return () => {};
      }) as never);

      subscribeToChatMessages(onData, vi.fn());

      expect(onData.mock.calls[0][0].map((m: { id: string }) => m.id)).toEqual([
        "old",
        "new",
      ]);
    });

    it("applies defaults for missing fields and asks for estimated server timestamps", () => {
      const onData = vi.fn();
      const doc = messageDoc("m", {});
      vi.mocked(onSnapshot).mockImplementation(((_q: unknown, next: (s: unknown) => void) => {
        next({ docs: [doc] });
        return () => {};
      }) as never);

      subscribeToChatMessages(onData, vi.fn());

      expect(doc.data).toHaveBeenCalledWith({ serverTimestamps: "estimate" });
      expect(onData.mock.calls[0][0][0]).toMatchObject({
        userId: "",
        displayName: "Hitchhiker",
        text: "",
      });
      expect(onData.mock.calls[0][0][0].createdAt).toBeInstanceOf(Date);
    });

    it("calls onError when the listener fails", () => {
      const onError = vi.fn();
      const failure = new Error("permission-denied");
      vi.mocked(onSnapshot).mockImplementation(((
        _q: unknown,
        _next: unknown,
        error: (e: Error) => void,
      ) => {
        error(failure);
        return () => {};
      }) as never);

      subscribeToChatMessages(vi.fn(), onError);

      expect(onError).toHaveBeenCalledWith(failure);
    });

    it("returns the unsubscribe function from Firestore", () => {
      const unsubscribe = vi.fn();
      vi.mocked(onSnapshot).mockReturnValue(unsubscribe as never);

      const result = subscribeToChatMessages(vi.fn(), vi.fn());
      result();

      expect(unsubscribe).toHaveBeenCalledOnce();
    });

    it("reports an error and returns a no-op unsubscribe when Firestore is not initialized", () => {
      firebase.db = null;
      const onError = vi.fn();

      const unsubscribe = subscribeToChatMessages(vi.fn(), onError);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Firebase Firestore is not initialized." }),
      );
      expect(() => unsubscribe()).not.toThrow();
      expect(onSnapshot).not.toHaveBeenCalled();
    });
  });
});
