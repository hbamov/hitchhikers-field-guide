import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteGuideEntryDialog } from "./DeleteGuideEntryDialog";
import { useDeleteGuideEntry } from "../../hooks/useDeleteGuideEntry";
import type { GuideEntry } from "../../../guide/types/guide.types";

vi.mock("../../hooks/useDeleteGuideEntry", () => ({
  useDeleteGuideEntry: vi.fn(),
}));

const mockedUseDeleteGuideEntry = vi.mocked(useDeleteGuideEntry);

function makeEntry(overrides: Partial<GuideEntry> = {}): GuideEntry {
  return {
    id: "magrathea",
    name: "Magrathea",
    category: "planet",
    summary: "Legendary world-building planet.",
    classification: "legendary",
    tags: ["core-world", "mythic"],
    ...overrides,
  };
}

describe("DeleteGuideEntryDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when entry is null", () => {
    mockedUseDeleteGuideEntry.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGuideEntry>);

    const { container } = render(
      <DeleteGuideEntryDialog open onClose={vi.fn()} entry={null} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders confirmation text with the entry name", () => {
    mockedUseDeleteGuideEntry.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGuideEntry>);

    render(
      <DeleteGuideEntryDialog
        open
        onClose={vi.fn()}
        entry={makeEntry({ name: "Heart of Gold" })}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Delete Guide entry?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/“Heart of Gold” will be permanently removed\./),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
  });

  it("calls mutate with entry id and closes on successful delete", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    mockedUseDeleteGuideEntry.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGuideEntry>);

    render(
      <DeleteGuideEntryDialog
        open
        onClose={onClose}
        entry={makeEntry({ id: "deep-thought" })}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith("deep-thought"),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("Couldn’t delete Guide entry. Please try again."),
    ).not.toBeInTheDocument();
  });

  it("shows a generic error and does not close when delete fails", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(new Error("raw backend error"));

    mockedUseDeleteGuideEntry.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteGuideEntry>);

    render(
      <DeleteGuideEntryDialog open onClose={onClose} entry={makeEntry()} />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn’t delete Guide entry. Please try again.",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent(
      "raw backend error",
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("disables actions while pending and shows 'Deleting...'", () => {
    mockedUseDeleteGuideEntry.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useDeleteGuideEntry>);

    render(
      <DeleteGuideEntryDialog open onClose={vi.fn()} entry={makeEntry()} />,
    );

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
  });
});
