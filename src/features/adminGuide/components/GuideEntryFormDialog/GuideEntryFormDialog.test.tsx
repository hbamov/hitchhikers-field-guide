import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuideEntryFormDialog } from "./GuideEntryFormDialog";

const mutateAsyncMock = vi.fn();

vi.mock("../hooks/useUpsertGuideEntry", () => ({
  useUpsertGuideEntry: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

describe("GuideEntryFormDialog edit semantics", () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
    mutateAsyncMock.mockResolvedValue(undefined);
  });

  it("keeps required fields and removes optional fields when cleared", async () => {
    const user = userEvent.setup();

    render(
      <GuideEntryFormDialog
        open
        onClose={vi.fn()}
        initialEntry={{
          id: "earth",
          name: "Earth",
          category: "planet",
          summary: "A small blue-green planet.",
          classification: "mostly-harmless",
          tags: ["planet", "sol"],
          description: "Long form text.",
          travelAdvisory: "Mind the bypass.",
        }}
      />,
    );

    const descriptionInput = screen.getByLabelText(/Description \(optional\)/i);
    const advisoryInput = screen.getByLabelText(
      /Travel advisory \(optional\)/i,
    );

    await user.clear(descriptionInput);
    await user.clear(advisoryInput);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalledTimes(1));

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      id: "earth",
      name: "Earth",
      category: "planet",
      summary: "A small blue-green planet.",
      classification: "mostly-harmless",
      tags: ["planet", "sol"],
      description: "",
      travelAdvisory: "",
    });
  });
});
