import { describe, expect, it } from "vitest";
import { makeGuideEntry } from "../../../test/factories";
import { selectFeaturedGuideEntry } from "./selectFeaturedGuideEntry";

const entries = ["a", "b", "c", "d", "e", "f", "g"].map((id) =>
  makeGuideEntry({ id, name: id.toUpperCase() }),
);

describe("selectFeaturedGuideEntry", () => {
  it("returns null for an empty list", () => {
    expect(selectFeaturedGuideEntry([], new Date(2026, 9, 14))).toBeNull();
  });

  it("returns the only entry when there is a single one", () => {
    const only = makeGuideEntry({ id: "solo" });

    expect(selectFeaturedGuideEntry([only], new Date(2026, 9, 14))).toBe(only);
  });

  it("returns the same entry for any time on the same local day", () => {
    const morning = selectFeaturedGuideEntry(entries, new Date(2026, 9, 14, 0, 1));
    const night = selectFeaturedGuideEntry(entries, new Date(2026, 9, 14, 23, 59));

    expect(night).toBe(morning);
  });

  it("does not depend on the order of the input entries", () => {
    for (const offset of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      const day = new Date(2026, 9, 1 + offset);
      expect(selectFeaturedGuideEntry([...entries].reverse(), day)?.id).toBe(
        selectFeaturedGuideEntry(entries, day)?.id,
      );
    }
  });

  it("rotates the featured entry across different days", () => {
    const ids = new Set<string>();
    for (let day = 1; day <= 30; day++) {
      ids.add(selectFeaturedGuideEntry(entries, new Date(2026, 9, day))!.id);
    }

    expect(ids.size).toBeGreaterThan(1);
  });
});
