import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  upsertGuideEntry,
  type UpsertGuideEntryInput,
} from "../../guide/services/guide.service";

export function useUpsertGuideEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertGuideEntryInput) => upsertGuideEntry(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["guideEntries"] });
    },
  });
}
