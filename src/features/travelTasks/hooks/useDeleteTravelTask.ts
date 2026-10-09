import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTravelTask } from "../services/travelTasks.service";

export function useDeleteTravelTask(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await deleteTravelTask(taskId);
    },
    onSuccess: async () => {
      if (!userId) return;
      await queryClient.invalidateQueries({
        queryKey: ["travelTasks", userId],
      });
    },
  });
}
