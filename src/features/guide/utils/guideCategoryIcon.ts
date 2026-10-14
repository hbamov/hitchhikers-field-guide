import {
  Cpu,
  Fish,
  Globe2,
  MapPin,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { GuideCategory } from "../types/guide.types";

export const guideCategoryIconMap: Record<GuideCategory, LucideIcon> = {
  planet: Globe2,
  species: Fish,
  place: MapPin,
  technology: Cpu,
  object: Package,
};
