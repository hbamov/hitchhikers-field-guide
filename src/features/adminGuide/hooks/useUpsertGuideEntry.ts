import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  upsertGuideEntry,
  type UpsertGuideEntryInput,
} from "../../guide/services/guide.service";

export function useUpsertGuideEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertGuideEntryInput) => upsertGuideEntry(input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["guideEntries"] }),
        queryClient.invalidateQueries({
          queryKey: ["guideEntry", variables.id],
        }),
      ]);
    },
  });
}
