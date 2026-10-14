import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeGuideEntry } from "../../guide/services/guide.service";

export function useDeleteGuideEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => removeGuideEntry(entryId),
    onSuccess: async (_data, entryId) => {
      queryClient.removeQueries({ queryKey: ["guideEntry", entryId] });
      await queryClient.invalidateQueries({ queryKey: ["guideEntries"] });
    },
  });
}
