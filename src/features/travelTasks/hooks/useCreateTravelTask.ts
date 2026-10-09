import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTravelTask } from "../services/travelTasks.service";
import type { CreateTravelTaskInput } from "../types/travelTask.types";

export function useCreateTravelTask(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTravelTaskInput) => {
      if (!userId) throw new Error("You must be signed in to create a task.");
      await createTravelTask(userId, input);
    },
    onSuccess: async () => {
      if (!userId) return;
      await queryClient.invalidateQueries({
        queryKey: ["travelTasks", userId],
      });
    },
  });
}
