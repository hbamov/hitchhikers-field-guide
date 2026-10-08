export const GUIDE_CATEGORIES = [
  "planet",
  "species",
  "place",
  "technology",
  "object",
] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export type GuideClassification =
  | "mostly-harmless"
  | "safe"
  | "caution"
  | "dangerous"
  | "legendary"
  | "unknown";

export interface GuideEntry {
  id: string;
  name: string;
  category: GuideCategory;
  summary: string;
  classification: GuideClassification;
  tags: string[];
}
