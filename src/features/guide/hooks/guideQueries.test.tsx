import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeGuideEntry } from "../../../test/factories";
import { createTestQueryClient } from "../../../test/renderWithProviders";
import { getGuideEntries, getGuideEntryById } from "../services/guide.service";
import { useGuideEntries } from "./useGuideEntries";
import { useGuideEntry } from "./useGuideEntry";

vi.mock("../services/guide.service");

function setup() {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe("guide queries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("useGuideEntries loads the list of entries", async () => {
    const { wrapper } = setup();
    const entries = [makeGuideEntry()];
    vi.mocked(getGuideEntries).mockResolvedValue(entries);

    const { result } = renderHook(() => useGuideEntries(), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(entries));
  });

  it("useGuideEntry fetches a single entry by id", async () => {
    const { wrapper } = setup();
    const entry = makeGuideEntry({ id: "fish" });
    vi.mocked(getGuideEntryById).mockResolvedValue(entry);

    const { result } = renderHook(() => useGuideEntry("fish"), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual(entry));
    expect(getGuideEntryById).toHaveBeenCalledWith("fish");
  });

  it("useGuideEntry does not fetch without an id", () => {
    const { wrapper } = setup();

    const { result } = renderHook(() => useGuideEntry(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getGuideEntryById).not.toHaveBeenCalled();
  });

  it("useGuideEntry shows the cached list entry immediately", () => {
    const { queryClient, wrapper } = setup();
    const cached = makeGuideEntry({ id: "earth", name: "Cached Earth" });
    queryClient.setQueryData(["guideEntries"], [cached]);
    vi.mocked(getGuideEntryById).mockResolvedValue(cached);

    const { result } = renderHook(() => useGuideEntry("earth"), { wrapper });

    expect(result.current.data?.name).toBe("Cached Earth");
  });
});
