import type { GuideEntry } from "../types/guide.types";

const preferredIds = ["magrathea", "heart-of-gold", "earth", "deep-thought"];

export function selectFeaturedGuideEntry(
  entries: GuideEntry[],
): GuideEntry | null {
  if (!entries.length) return null;

  for (const id of preferredIds) {
    const found = entries.find((entry) => entry.id === id);
    if (found) return found;
  }

  return entries[0] ?? null;
}
