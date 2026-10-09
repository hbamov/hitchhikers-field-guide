import { z } from "zod";

export const GUIDE_CATEGORIES = [
  "planet",
  "species",
  "place",
  "technology",
  "object",
] as const;

export const GUIDE_CLASSIFICATIONS = [
  "mostly-harmless",
  "safe",
  "caution",
  "dangerous",
  "legendary",
  "unknown",
] as const;

export const guideEntrySchema = z.object({
  name: z.string().min(1),
  category: z.enum(GUIDE_CATEGORIES),
  summary: z.string().min(1),
  classification: z.enum(GUIDE_CLASSIFICATIONS),
  tags: z.array(z.string()).default([]),
});

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];
export type GuideClassification = (typeof GUIDE_CLASSIFICATIONS)[number];
export type GuideEntry = z.infer<typeof guideEntrySchema> & { id: string };
