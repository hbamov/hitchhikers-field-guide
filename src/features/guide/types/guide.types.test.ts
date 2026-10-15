import { describe, expect, it } from "vitest";
import {
  GUIDE_ADVISORY_MAX,
  GUIDE_DESCRIPTION_MAX,
  GUIDE_NAME_MAX,
  GUIDE_SUMMARY_MAX,
  GUIDE_TAGS_MAX,
  guideEntrySchema,
  guideEntryWriteSchema,
} from "./guide.types";

const valid = {
  name: "Babel Fish",
  category: "species",
  summary: "Translates any language.",
  classification: "legendary",
  tags: ["language"],
};

describe.each([
  ["guideEntrySchema", guideEntrySchema],
  ["guideEntryWriteSchema", guideEntryWriteSchema],
])("%s", (_name, schema) => {
  it("accepts a legacy document without description or travelAdvisory", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("accepts a document with description and travelAdvisory", () => {
    const result = schema.safeParse({
      ...valid,
      description: "Long text",
      travelAdvisory: "Keep it in your ear",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unknown category", () => {
    expect(schema.safeParse({ ...valid, category: "galaxy" }).success).toBe(false);
  });

  it("rejects an unknown classification", () => {
    expect(schema.safeParse({ ...valid, classification: "tasty" }).success).toBe(
      false,
    );
  });

  it("rejects a description longer than the limit", () => {
    const description = "x".repeat(GUIDE_DESCRIPTION_MAX + 1);

    expect(schema.safeParse({ ...valid, description }).success).toBe(false);
    expect(
      schema.safeParse({ ...valid, description: "x".repeat(GUIDE_DESCRIPTION_MAX) })
        .success,
    ).toBe(true);
  });

  it("rejects a travel advisory longer than the limit", () => {
    const travelAdvisory = "x".repeat(GUIDE_ADVISORY_MAX + 1);

    expect(schema.safeParse({ ...valid, travelAdvisory }).success).toBe(false);
  });
});

describe("guideEntrySchema", () => {
  it("defaults missing tags to an empty list (legacy documents)", () => {
    const { tags: _tags, ...withoutTags } = valid;
    const result = guideEntrySchema.parse(withoutTags);

    expect(result.tags).toEqual([]);
  });

  it("does not enforce the write-side length limits when reading", () => {
    const result = guideEntrySchema.safeParse({
      ...valid,
      name: "x".repeat(GUIDE_NAME_MAX + 1),
    });

    expect(result.success).toBe(true);
  });
});

describe("guideEntryWriteSchema", () => {
  it("rejects a name longer than the limit but accepts exactly the limit", () => {
    expect(
      guideEntryWriteSchema.safeParse({ ...valid, name: "x".repeat(GUIDE_NAME_MAX) })
        .success,
    ).toBe(true);
    expect(
      guideEntryWriteSchema.safeParse({
        ...valid,
        name: "x".repeat(GUIDE_NAME_MAX + 1),
      }).success,
    ).toBe(false);
  });

  it("rejects a summary longer than the limit", () => {
    expect(
      guideEntryWriteSchema.safeParse({
        ...valid,
        summary: "x".repeat(GUIDE_SUMMARY_MAX + 1),
      }).success,
    ).toBe(false);
  });

  it("rejects more than the maximum number of tags", () => {
    const tags = Array.from({ length: GUIDE_TAGS_MAX + 1 }, (_, i) => `t${i}`);

    expect(guideEntryWriteSchema.safeParse({ ...valid, tags }).success).toBe(false);
    expect(
      guideEntryWriteSchema.safeParse({ ...valid, tags: tags.slice(0, GUIDE_TAGS_MAX) })
        .success,
    ).toBe(true);
  });

  it("rejects empty tags", () => {
    expect(guideEntryWriteSchema.safeParse({ ...valid, tags: [""] }).success).toBe(
      false,
    );
  });
});
