import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GuideEntry } from "../../guide/types/guide.types";
import { createTravelTaskFromGuideEntry } from "../services/travelTasks.service";

export function useCreateTravelTaskFromGuide(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: GuideEntry) => {
      if (!userId)
        throw new Error("You must be signed in to add checklist items.");
      await createTravelTaskFromGuideEntry(userId, entry);
    },
    onSuccess: async () => {
      if (!userId) return;
      await queryClient.invalidateQueries({
        queryKey: ["travelTasks", userId],
      });
    },
  });
}
