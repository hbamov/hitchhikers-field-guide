import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { GuideEntry } from "../types/guide.types";
import { getGuideEntryById } from "../services/guide.service";

export function useGuideEntry(entryId?: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["guideEntry", entryId],
    queryFn: () => getGuideEntryById(entryId!),
    enabled: Boolean(entryId),
    initialData: () => {
      if (!entryId) return undefined;
      const list = queryClient.getQueryData<GuideEntry[]>(["guideEntries"]);
      return list?.find((entry) => entry.id === entryId) ?? undefined;
    },
  });
}
