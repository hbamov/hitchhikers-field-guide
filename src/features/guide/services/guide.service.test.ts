import { beforeEach, describe, expect, it, vi } from "vitest";

const firebase = vi.hoisted(() => ({ db: {} as object | null }));

vi.mock("../../../shared/firebase/firebase", () => ({
  get db() {
    return firebase.db;
  },
}));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db, name) => ({ collection: name })),
  doc: vi.fn((_db, name, id) => ({ doc: `${name}/${id}` })),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
}));

import { deleteDoc, getDoc, getDocs, setDoc } from "firebase/firestore";
import {
  getGuideEntries,
  getGuideEntryById,
  removeGuideEntry,
  upsertGuideEntry,
  type UpsertGuideEntryInput,
} from "./guide.service";

const validData = {
  name: "Earth",
  category: "planet",
  summary: "Mostly harmless.",
  classification: "mostly-harmless",
  tags: ["terra"],
};

function snapshotDoc(id: string, data: unknown) {
  return { id, data: () => data };
}

const input: UpsertGuideEntryInput = {
  id: "earth",
  name: "  Earth  ",
  category: "planet",
  summary: "  Mostly harmless.  ",
  classification: "mostly-harmless",
  tags: [" terra ", "  ", "sol"],
  description: "   ",
  travelAdvisory: "",
};

describe("guide.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebase.db = {};
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("getGuideEntries", () => {
    it("returns valid documents with their ids and skips invalid ones", async () => {
      vi.mocked(getDocs).mockResolvedValue({
        docs: [
          snapshotDoc("earth", validData),
          snapshotDoc("broken", { ...validData, category: "galaxy" }),
          snapshotDoc("fish", { ...validData, name: "Babel Fish" }),
        ],
      } as never);

      const entries = await getGuideEntries();

      expect(entries.map((entry) => entry.id)).toEqual(["earth", "fish"]);
      expect(entries[1].name).toBe("Babel Fish");
    });

    it("throws a clear error when Firestore is not initialized", async () => {
      firebase.db = null;

      await expect(getGuideEntries()).rejects.toThrow(
        "Firebase Firestore is not initialized.",
      );
    });
  });

  describe("getGuideEntryById", () => {
    it("returns null when the document does not exist", async () => {
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);

      await expect(getGuideEntryById("nope")).resolves.toBeNull();
    });

    it("returns the entry with its id when the document is valid", async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: "earth",
        data: () => validData,
      } as never);

      await expect(getGuideEntryById("earth")).resolves.toMatchObject({
        id: "earth",
        name: "Earth",
      });
    });

    it("returns null when the stored document is invalid", async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: "earth",
        data: () => ({ name: "" }),
      } as never);

      await expect(getGuideEntryById("earth")).resolves.toBeNull();
    });

    it("throws a clear error when Firestore is not initialized", async () => {
      firebase.db = null;

      await expect(getGuideEntryById("earth")).rejects.toThrow(
        "Firebase Firestore is not initialized.",
      );
    });
  });

  describe("upsertGuideEntry", () => {
    it("trims input, drops blank tags and omits empty optional fields", async () => {
      await upsertGuideEntry(input);

      expect(setDoc).toHaveBeenCalledOnce();
      expect(setDoc).toHaveBeenCalledWith(
        { doc: "guideEntries/earth" },
        {
          name: "Earth",
          category: "planet",
          summary: "Mostly harmless.",
          classification: "mostly-harmless",
          tags: ["terra", "sol"],
        },
      );
    });

    it("includes trimmed optional fields when provided", async () => {
      await upsertGuideEntry({
        ...input,
        description: " Long text ",
        travelAdvisory: " Bring a towel ",
      });

      expect(vi.mocked(setDoc).mock.calls[0][1]).toMatchObject({
        description: "Long text",
        travelAdvisory: "Bring a towel",
      });
    });

    it("replaces the document instead of merging", async () => {
      await upsertGuideEntry(input);

      expect(vi.mocked(setDoc).mock.calls[0]).toHaveLength(2);
    });

    it("throws and does not write when the data is invalid", async () => {
      await expect(
        upsertGuideEntry({ ...input, name: "x".repeat(101) }),
      ).rejects.toThrow("Invalid guide entry data.");
      await expect(upsertGuideEntry({ ...input, name: "   " })).rejects.toThrow(
        "Invalid guide entry data.",
      );

      expect(setDoc).not.toHaveBeenCalled();
    });

    it("throws a clear error when Firestore is not initialized", async () => {
      firebase.db = null;

      await expect(upsertGuideEntry(input)).rejects.toThrow(
        "Firebase Firestore is not initialized.",
      );
    });
  });

  describe("removeGuideEntry", () => {
    it("deletes the entry document", async () => {
      await removeGuideEntry("earth");

      expect(deleteDoc).toHaveBeenCalledWith({ doc: "guideEntries/earth" });
    });

    it("throws a clear error when Firestore is not initialized", async () => {
      firebase.db = null;

      await expect(removeGuideEntry("earth")).rejects.toThrow(
        "Firebase Firestore is not initialized.",
      );
      expect(deleteDoc).not.toHaveBeenCalled();
    });
  });
});
