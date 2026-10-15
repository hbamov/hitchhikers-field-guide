import { describe, expect, it } from "vitest";
import { formatDateInput, parseDateInput } from "./date";

describe("travel task date helpers", () => {
  it("parses a date input value as a local date, not UTC", () => {
    const date = parseDateInput("2026-03-09")!;

    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
      2026, 2, 9,
    ]);
    expect(date.getHours()).toBe(0);
  });

  it.each(["", "2026-03", "not-a-date"])(
    "returns undefined for the unusable value %j",
    (value) => {
      expect(parseDateInput(value)).toBeUndefined();
    },
  );

  it("formats a date with zero-padded month and day", () => {
    expect(formatDateInput(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("returns an empty string when there is no date", () => {
    expect(formatDateInput(undefined)).toBe("");
  });

  it("round-trips a value through parse and format", () => {
    expect(formatDateInput(parseDateInput("2026-12-31"))).toBe("2026-12-31");
  });
});
