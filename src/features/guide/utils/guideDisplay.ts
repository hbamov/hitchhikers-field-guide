import { CircleHelp, Cpu, Fish, Globe2, MapPin, Package } from "lucide-react";
import type { GuideCategory, GuideClassification } from "../types/guide.types";

export const CATEGORY_META: Record<
  GuideCategory,
  { label: string; icon: typeof Globe2; color: string }
> = {
  planet: { label: "Planet", icon: Globe2, color: "#4fc3f7" },
  species: { label: "Species", icon: Fish, color: "#f2c14e" },
  place: { label: "Place", icon: MapPin, color: "#ff8a65" },
  technology: { label: "Technology", icon: Cpu, color: "#7e9cff" },
  object: { label: "Object", icon: Package, color: "#b39ddb" },
};

export const FALLBACK_CATEGORY_META = {
  label: "Other",
  icon: CircleHelp,
  color: "#90a4ae",
};

export const CLASSIFICATION_META: Record<
  GuideClassification,
  { label: string; color: string }
> = {
  "mostly-harmless": { label: "Mostly harmless", color: "#9ccc65" },
  safe: { label: "Safe", color: "#4caf8a" },
  caution: { label: "Caution advised", color: "#ffb300" },
  dangerous: { label: "Dangerous", color: "#ef5350" },
  legendary: { label: "Legendary", color: "#ba68c8" },
  unknown: { label: "Unknown", color: "#90a4ae" },
};

export function getCategoryMeta(category: GuideCategory) {
  return CATEGORY_META[category] ?? FALLBACK_CATEGORY_META;
}

export function getClassificationMeta(classification: GuideClassification) {
  return CLASSIFICATION_META[classification] ?? CLASSIFICATION_META.unknown;
}
