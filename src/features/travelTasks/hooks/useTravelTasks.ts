import { useQuery } from "@tanstack/react-query";
import { getTravelTasks } from "../services/travelTasks.service";

export function useTravelTasks(userId?: string) {
  return useQuery({
    queryKey: ["travelTasks", userId],
    queryFn: async () => getTravelTasks(userId!),
    enabled: Boolean(userId),
  });
}
