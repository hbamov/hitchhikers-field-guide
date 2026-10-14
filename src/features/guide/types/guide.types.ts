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

export const GUIDE_DESCRIPTION_MAX = 2000;
export const GUIDE_ADVISORY_MAX = 500;

export const guideEntrySchema = z.object({
  name: z.string().min(1),
  category: z.enum(GUIDE_CATEGORIES),
  summary: z.string().min(1),
  classification: z.enum(GUIDE_CLASSIFICATIONS),
  tags: z.array(z.string()).default([]),
  // Optional, so existing documents remain valid
  description: z.string().max(GUIDE_DESCRIPTION_MAX).optional(),
  travelAdvisory: z.string().max(GUIDE_ADVISORY_MAX).optional(),
});

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];
export type GuideClassification = (typeof GUIDE_CLASSIFICATIONS)[number];
export type GuideEntry = z.infer<typeof guideEntrySchema> & { id: string };
