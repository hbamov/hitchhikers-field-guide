import { useQuery } from "@tanstack/react-query";

import { getGuideEntries } from "../services/guide.service";

export function useGuideEntries() {
  return useQuery({
    queryKey: ["guideEntries"],
    queryFn: getGuideEntries,
  });
}
