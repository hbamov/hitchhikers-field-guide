import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestQueryClient } from "../../../test/renderWithProviders";
import { removeGuideEntry, upsertGuideEntry } from "../../guide/services/guide.service";
import { useDeleteGuideEntry } from "./useDeleteGuideEntry";
import { useUpsertGuideEntry } from "./useUpsertGuideEntry";

vi.mock("../../guide/services/guide.service");

function setup() {
  const queryClient = createTestQueryClient();
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const remove = vi.spyOn(queryClient, "removeQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { invalidate, remove, wrapper };
}

const input = {
  id: "earth",
  name: "Earth",
  category: "planet" as const,
  summary: "Mostly harmless.",
  classification: "mostly-harmless" as const,
  tags: [],
};

describe("guide admin mutations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("useUpsertGuideEntry saves the entry and invalidates the list and the entry queries", async () => {
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useUpsertGuideEntry(), { wrapper });

    await act(() => result.current.mutateAsync(input));

    expect(upsertGuideEntry).toHaveBeenCalledWith(input);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["guideEntries"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["guideEntry", "earth"] });
  });

  it("useUpsertGuideEntry does not invalidate anything when saving fails", async () => {
    const { invalidate, wrapper } = setup();
    vi.mocked(upsertGuideEntry).mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useUpsertGuideEntry(), { wrapper });

    act(() => result.current.mutate(input));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("useDeleteGuideEntry deletes the entry, drops its cached query and refreshes the list", async () => {
    const { invalidate, remove, wrapper } = setup();
    const { result } = renderHook(() => useDeleteGuideEntry(), { wrapper });

    await act(() => result.current.mutateAsync("earth"));

    expect(removeGuideEntry).toHaveBeenCalledWith("earth");
    expect(remove).toHaveBeenCalledWith({ queryKey: ["guideEntry", "earth"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["guideEntries"] });
  });

  it("useDeleteGuideEntry keeps caches untouched when deleting fails", async () => {
    const { invalidate, remove, wrapper } = setup();
    vi.mocked(removeGuideEntry).mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useDeleteGuideEntry(), { wrapper });

    act(() => result.current.mutate("earth"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(remove).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
  });
});
