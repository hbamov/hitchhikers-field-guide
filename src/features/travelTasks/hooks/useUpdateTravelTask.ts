import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTravelTask } from "../services/travelTasks.service";
import type { UpdateTravelTaskInput } from "../types/travelTask.types";

interface UpdateArgs {
  taskId: string;
  input: UpdateTravelTaskInput;
}

export function useUpdateTravelTask(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, input }: UpdateArgs) => {
      await updateTravelTask(taskId, input);
    },
    onSuccess: async () => {
      if (!userId) return;
      await queryClient.invalidateQueries({
        queryKey: ["travelTasks", userId],
      });
    },
  });
}
