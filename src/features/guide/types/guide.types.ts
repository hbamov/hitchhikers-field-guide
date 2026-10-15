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

export const GUIDE_NAME_MAX = 100;
export const GUIDE_SUMMARY_MAX = 1000;
export const GUIDE_TAGS_MAX = 20;
export const GUIDE_DESCRIPTION_MAX = 2000;
export const GUIDE_ADVISORY_MAX = 500;

export const guideEntrySchema = z.object({
  name: z.string().min(1),
  category: z.enum(GUIDE_CATEGORIES),
  summary: z.string().min(1),
  classification: z.enum(GUIDE_CLASSIFICATIONS),
  tags: z.array(z.string()).default([]),
  description: z.string().max(GUIDE_DESCRIPTION_MAX).optional(),
  travelAdvisory: z.string().max(GUIDE_ADVISORY_MAX).optional(),
});

export const guideEntryWriteSchema = guideEntrySchema.extend({
  name: z.string().min(1).max(GUIDE_NAME_MAX),
  summary: z.string().min(1).max(GUIDE_SUMMARY_MAX),
  tags: z.array(z.string().min(1)).max(GUIDE_TAGS_MAX),
});

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];
export type GuideClassification = (typeof GUIDE_CLASSIFICATIONS)[number];
export type GuideEntry = z.infer<typeof guideEntrySchema> & { id: string };
