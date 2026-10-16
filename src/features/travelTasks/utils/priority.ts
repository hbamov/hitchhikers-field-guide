import type { TaskPriority } from "../types/travelTask.types";

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; color: string }
> = {
  high: { label: "High priority", color: "#ef5350" },
  medium: { label: "Medium priority", color: "#ffb300" },
  low: { label: "Low priority", color: "#4caf8a" },
};

export const COMPLETED_COLOR = "#78909c";

export function getPriorityMeta(priority: TaskPriority) {
  return PRIORITY_META[priority] ?? PRIORITY_META.medium;
}
