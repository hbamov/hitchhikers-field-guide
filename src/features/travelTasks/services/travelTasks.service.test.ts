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
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, name, id) => ({ doc: `${name}/${id}` })),
  getDocs: vi.fn(),
  orderBy: vi.fn((field, dir) => ({ orderBy: [field, dir] })),
  query: vi.fn((...parts) => ({ query: parts })),
  serverTimestamp: vi.fn(() => "SERVER_TS"),
  updateDoc: vi.fn(),
  where: vi.fn((field, op, value) => ({ where: [field, op, value] })),
}));

import { addDoc, deleteDoc, getDocs, updateDoc } from "firebase/firestore";
import { makeGuideEntry } from "../../../test/factories";
import {
  createTravelTask,
  createTravelTaskFromGuideEntry,
  deleteTravelTask,
  getTravelTasks,
  updateTravelTask,
} from "./travelTasks.service";

const ts = (iso: string) => ({ toDate: () => new Date(iso) });

describe("travelTasks.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebase.db = {};
  });

  describe("getTravelTasks", () => {
    it("maps Firestore timestamps to dates and leaves optional ones undefined", async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          {
            id: "t1",
            data: () => ({
              userId: "u1",
              title: "Pack towel",
              status: "completed",
              priority: "high",
              dueDate: ts("2026-02-01T00:00:00Z"),
              createdAt: ts("2026-01-01T00:00:00Z"),
              updatedAt: ts("2026-01-02T00:00:00Z"),
              completedAt: ts("2026-01-03T00:00:00Z"),
            }),
          },
          {
            id: "t2",
            data: () => ({
              userId: "u1",
              title: "Find tea",
              status: "open",
              priority: "low",
              createdAt: ts("2026-01-01T00:00:00Z"),
              updatedAt: ts("2026-01-01T00:00:00Z"),
            }),
          },
        ],
      } as never);

      const tasks = await getTravelTasks("u1");

      expect(tasks[0]).toMatchObject({
        id: "t1",
        dueDate: new Date("2026-02-01T00:00:00Z"),
        completedAt: new Date("2026-01-03T00:00:00Z"),
      });
      expect(tasks[1].dueDate).toBeUndefined();
      expect(tasks[1].completedAt).toBeUndefined();
    });

    it("only queries the given user's tasks, newest first", async () => {
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as never);

      await getTravelTasks("u1");

      const queryArg = vi.mocked(getDocs).mock.calls[0][0] as unknown as {
        query: unknown[];
      };
      expect(queryArg.query).toContainEqual({ where: ["userId", "==", "u1"] });
      expect(queryArg.query).toContainEqual({ orderBy: ["createdAt", "desc"] });
    });

    it("throws a clear error when Firestore is not initialized", async () => {
      firebase.db = null;

      await expect(getTravelTasks("u1")).rejects.toThrow(
        "Firebase Firestore is not initialized.",
      );
    });
  });

  describe("createTravelTask", () => {
    it("creates an open task with trimmed title and server timestamps", async () => {
      await createTravelTask("u1", {
        title: "  Pack towel  ",
        description: "  Big one  ",
        priority: "high",
      });

      expect(addDoc).toHaveBeenCalledWith(
        { collection: "travelTasks" },
        {
          userId: "u1",
          title: "Pack towel",
          description: "Big one",
          status: "open",
          priority: "high",
          dueDate: null,
          createdAt: "SERVER_TS",
          updatedAt: "SERVER_TS",
          completedAt: null,
        },
      );
    });

    it("stores an empty description and the due date when given", async () => {
      const dueDate = new Date(2026, 5, 1);

      await createTravelTask("u1", { title: "x", priority: "low", dueDate });

      expect(vi.mocked(addDoc).mock.calls[0][1]).toMatchObject({
        description: "",
        dueDate,
      });
    });

    it("throws a clear error when Firestore is not initialized", async () => {
      firebase.db = null;

      await expect(
        createTravelTask("u1", { title: "x", priority: "low" }),
      ).rejects.toThrow("Firebase Firestore is not initialized.");
    });
  });

  describe("updateTravelTask", () => {
    it("sends only the provided fields plus updatedAt", async () => {
      await updateTravelTask("t1", { status: "completed" });

      expect(updateDoc).toHaveBeenCalledWith(
        { doc: "travelTasks/t1" },
        { updatedAt: "SERVER_TS", status: "completed" },
      );
    });

    it("trims text fields and sends every field that was provided", async () => {
      const dueDate = new Date(2026, 5, 1);
      const completedAt = new Date(2026, 5, 2);

      await updateTravelTask("t1", {
        title: " New ",
        description: " Desc ",
        priority: "low",
        status: "open",
        dueDate,
        completedAt,
      });

      expect(vi.mocked(updateDoc).mock.calls[0][1]).toEqual({
        updatedAt: "SERVER_TS",
        title: "New",
        description: "Desc",
        priority: "low",
        status: "open",
        dueDate,
        completedAt,
      });
    });

    it("clears the due date and completion date when null is passed", async () => {
      await updateTravelTask("t1", { dueDate: null, completedAt: null });

      expect(vi.mocked(updateDoc).mock.calls[0][1]).toEqual({
        updatedAt: "SERVER_TS",
        dueDate: null,
        completedAt: null,
      });
    });

    it("throws a clear error when Firestore is not initialized", async () => {
      firebase.db = null;

      await expect(updateTravelTask("t1", {})).rejects.toThrow(
        "Firebase Firestore is not initialized.",
      );
    });
  });

  describe("deleteTravelTask", () => {
    it("deletes the task document", async () => {
      await deleteTravelTask("t1");

      expect(deleteDoc).toHaveBeenCalledWith({ doc: "travelTasks/t1" });
    });

    it("throws a clear error when Firestore is not initialized", async () => {
      firebase.db = null;

      await expect(deleteTravelTask("t1")).rejects.toThrow(
        "Firebase Firestore is not initialized.",
      );
    });
  });

  describe("createTravelTaskFromGuideEntry", () => {
    it("creates a medium-priority 'Research <name>' task from the entry", async () => {
      await createTravelTaskFromGuideEntry(
        "u1",
        makeGuideEntry({ name: "Babel Fish", category: "species", summary: "Translates." }),
      );

      expect(vi.mocked(addDoc).mock.calls[0][1]).toMatchObject({
        userId: "u1",
        title: "Research Babel Fish",
        description: "Guide category: species. Translates.",
        priority: "medium",
        status: "open",
      });
    });

    it("truncates a long description to 500 characters", async () => {
      await createTravelTaskFromGuideEntry(
        "u1",
        makeGuideEntry({ summary: "x".repeat(900) }),
      );

      const { description } = vi.mocked(addDoc).mock.calls[0][1] as {
        description: string;
      };
      expect(description).toHaveLength(500);
      expect(description.endsWith("...")).toBe(true);
    });
  });
});
