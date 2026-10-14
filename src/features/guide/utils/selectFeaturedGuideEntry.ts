import type { GuideEntry } from "../types/guide.types";

/**
 * Returns a deterministic "day key" in local time.
 * Example: "2026-10-14"
 */
function getLocalDayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Tiny deterministic hash (FNV-like) for stable index selection.
 */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Daily deterministic featured entry:
 * - same entry for all users on the same local day
 * - rotates next day
 * - stable for a given day + set of entries
 */
export function selectFeaturedGuideEntry(
  entries: GuideEntry[],
  date = new Date(),
): GuideEntry | null {
  if (!entries.length) return null;

  // Stable order so index mapping is deterministic
  const sorted = [...entries].sort((a, b) => a.id.localeCompare(b.id));

  const dayKey = getLocalDayKey(date);
  const seed = `${dayKey}:${sorted.length}`;
  const index = hashString(seed) % sorted.length;

  return sorted[index] ?? null;
}
