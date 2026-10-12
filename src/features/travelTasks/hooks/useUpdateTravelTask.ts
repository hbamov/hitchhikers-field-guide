import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTravelTask } from "../services/travelTasks.service";
import type {
  TravelTask,
  UpdateTravelTaskInput,
} from "../types/travelTask.types";

interface UpdateArgs {
  taskId: string;
  input: UpdateTravelTaskInput;
}

export function useUpdateTravelTask(userId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["travelTasks", userId] as const;

  return useMutation({
    mutationFn: async ({ taskId, input }: UpdateArgs) => {
      await updateTravelTask(taskId, input);
    },
    onMutate: async ({ taskId, input }) => {
      if (!userId) return { previousTasks: undefined };

      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<TravelTask[]>(queryKey);

      if (previousTasks) {
        const nextTasks = previousTasks.map((task) => {
          if (task.id !== taskId) return task;

          return {
            ...task,
            ...(input.title !== undefined ? { title: input.title } : {}),
            ...(input.description !== undefined
              ? { description: input.description }
              : {}),
            ...(input.priority !== undefined
              ? { priority: input.priority }
              : {}),
            ...(input.status !== undefined ? { status: input.status } : {}),
            ...(input.dueDate !== undefined
              ? { dueDate: input.dueDate ?? undefined }
              : {}),
            ...(input.completedAt !== undefined
              ? { completedAt: input.completedAt ?? undefined }
              : {}),
            updatedAt: new Date(),
          };
        });

        queryClient.setQueryData(queryKey, nextTasks);
      }

      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      if (!userId) return;
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },
    onSettled: async () => {
      if (!userId) return;
      await queryClient.invalidateQueries({ queryKey });
    },
  });
}
