import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeGuideEntry } from "../../../../test/factories";
import { renderWithProviders } from "../../../../test/renderWithProviders";
import { upsertGuideEntry } from "../../../guide/services/guide.service";
import { GuideEntryFormDialog } from "./GuideEntryFormDialog";

vi.mock("../../../guide/services/guide.service");

const existing = makeGuideEntry({
  id: "earth",
  name: "Earth",
  summary: "A small blue-green planet.",
  tags: ["planet", "sol"],
  description: "Long form text.",
  travelAdvisory: "Mind the bypass.",
});

const field = (name: RegExp | string) => screen.getByLabelText(name);

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(field("Entry ID"), "heart-of-gold");
  await user.type(field("Name"), "Heart of Gold");
  await user.type(field("Summary"), "A stolen spaceship.");
}

describe("GuideEntryFormDialog", () => {
  beforeEach(() => vi.resetAllMocks());

  describe("create mode", () => {
    it("creates an entry with defaults, parsed tags and empty optional fields", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithProviders(<GuideEntryFormDialog open onClose={onClose} />);
      expect(screen.getByRole("heading", { name: "Create Guide entry" })).toBeInTheDocument();

      await fillRequired(user);
      await user.type(field("Tags (comma-separated)"), "ship,improbable");
      await user.click(screen.getByRole("button", { name: "Create entry" }));

      await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
      expect(upsertGuideEntry).toHaveBeenCalledWith({
        id: "heart-of-gold",
        name: "Heart of Gold",
        category: "planet",
        summary: "A stolen spaceship.",
        classification: "unknown",
        tags: ["ship", "improbable"],
        description: "",
        travelAdvisory: "",
      });
    });

    it("requires an id, name and summary", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GuideEntryFormDialog open onClose={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "Create entry" }));

      expect(await screen.findByText("ID is required.")).toBeInTheDocument();
      expect(screen.getByText("Name is required.")).toBeInTheDocument();
      expect(screen.getByText("Summary is required.")).toBeInTheDocument();
      expect(upsertGuideEntry).not.toHaveBeenCalled();
    });

    it("rejects an id with uppercase letters or spaces", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GuideEntryFormDialog open onClose={vi.fn()} />);

      await fillRequired(user);
      await user.clear(field("Entry ID"));
      await user.type(field("Entry ID"), "Heart Of Gold");
      await user.click(screen.getByRole("button", { name: "Create entry" }));

      expect(
        await screen.findByText("Use lowercase letters, numbers, and hyphens."),
      ).toBeInTheDocument();
      expect(upsertGuideEntry).not.toHaveBeenCalled();
    });

    it("rejects a name that is too long", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GuideEntryFormDialog open onClose={vi.fn()} />);

      await fillRequired(user);
      await user.clear(field("Name"));
      await user.click(field("Name"));
      await user.paste("x".repeat(101));
      await user.click(screen.getByRole("button", { name: "Create entry" }));

      expect(
        await screen.findByText("Name must be 100 characters or fewer."),
      ).toBeInTheDocument();
      expect(upsertGuideEntry).not.toHaveBeenCalled();
    });

    it("rejects more than 20 tags", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GuideEntryFormDialog open onClose={vi.fn()} />);

      await fillRequired(user);
      await user.click(field("Tags (comma-separated)"));
      await user.paste(Array.from({ length: 21 }, (_, i) => `t${i}`).join(","));
      await user.click(screen.getByRole("button", { name: "Create entry" }));

      expect(await screen.findByText("Use at most 20 tags.")).toBeInTheDocument();
      expect(upsertGuideEntry).not.toHaveBeenCalled();
    });

    it("rejects an over-long summary, description and travel advisory", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GuideEntryFormDialog open onClose={vi.fn()} />);

      await fillRequired(user);
      await user.clear(field("Summary"));
      await user.click(field("Summary"));
      await user.paste("x".repeat(1001));
      await user.click(field(/Description \(optional\)/));
      await user.paste("x".repeat(2001));
      await user.click(field(/Travel advisory \(optional\)/));
      await user.paste("x".repeat(501));
      await user.click(screen.getByRole("button", { name: "Create entry" }));

      expect(await screen.findByText("Summary must be 1000 characters or fewer.")).toBeInTheDocument();
      expect(screen.getByText("Description must be 2000 characters or fewer.")).toBeInTheDocument();
      expect(screen.getByText("Travel advisory must be 500 characters or fewer.")).toBeInTheDocument();
    });

    it("lets the admin pick a category and classification", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GuideEntryFormDialog open onClose={vi.fn()} />);
      await fillRequired(user);

      await user.click(screen.getByRole("combobox", { name: "Category" }));
      await user.click(await screen.findByRole("option", { name: "technology" }));
      await user.click(screen.getByRole("combobox", { name: "Classification" }));
      await user.click(await screen.findByRole("option", { name: "dangerous" }));
      await user.click(screen.getByRole("button", { name: "Create entry" }));

      await waitFor(() => expect(upsertGuideEntry).toHaveBeenCalled());
      expect(vi.mocked(upsertGuideEntry).mock.calls[0][0]).toMatchObject({
        category: "technology",
        classification: "dangerous",
      });
    });
  });

  describe("edit mode", () => {
    it("prefills the fields and disables the id", () => {
      renderWithProviders(<GuideEntryFormDialog open onClose={vi.fn()} initialEntry={existing} />);

      expect(screen.getByRole("heading", { name: "Edit Guide entry" })).toBeInTheDocument();
      expect(field("Entry ID")).toHaveValue("earth");
      expect(field("Entry ID")).toBeDisabled();
      expect(field("Name")).toHaveValue("Earth");
      expect(field("Summary")).toHaveValue("A small blue-green planet.");
      expect(field("Tags (comma-separated)")).toHaveValue("planet, sol");
      expect(field(/Description \(optional\)/)).toHaveValue("Long form text.");
      expect(field(/Travel advisory \(optional\)/)).toHaveValue("Mind the bypass.");
      expect(screen.getByRole("combobox", { name: "Category" })).toHaveTextContent("planet");
      expect(screen.getByRole("combobox", { name: "Classification" })).toHaveTextContent(
        "mostly-harmless",
      );
    });

    it("keeps required fields and submits empty strings for cleared optional fields", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GuideEntryFormDialog open onClose={vi.fn()} initialEntry={existing} />);

      await user.clear(field(/Description \(optional\)/));
      await user.clear(field(/Travel advisory \(optional\)/));
      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => expect(upsertGuideEntry).toHaveBeenCalledOnce());
      const payload = vi.mocked(upsertGuideEntry).mock.calls[0][0];
      expect(payload).toMatchObject({
        id: "earth",
        name: "Earth",
        category: "planet",
        summary: "A small blue-green planet.",
        classification: "mostly-harmless",
        description: "",
        travelAdvisory: "",
      });
      expect(payload.tags.map((tag) => tag.trim())).toEqual(["planet", "sol"]);
    });

    it("submits an empty tag list when the tags are cleared", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GuideEntryFormDialog open onClose={vi.fn()} initialEntry={existing} />);

      await user.clear(field("Tags (comma-separated)"));
      await user.click(screen.getByRole("button", { name: "Save changes" }));

      await waitFor(() => expect(upsertGuideEntry).toHaveBeenCalled());
      expect(vi.mocked(upsertGuideEntry).mock.calls[0][0].tags).toEqual([]);
    });
  });

  it("shows a generic error and keeps the dialog open when saving fails", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(upsertGuideEntry).mockRejectedValue(new Error("permission-denied: internal"));
    renderWithProviders(<GuideEntryFormDialog open onClose={onClose} initialEntry={existing} />);

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Couldn’t save Guide entry. Please try again.")).toBeInTheDocument();
    expect(screen.queryByText(/internal/)).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Edit Guide entry" })).toBeInTheDocument();
  });

  it("disables Cancel and Save and ignores Escape while saving", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    let finish!: () => void;
    vi.mocked(upsertGuideEntry).mockReturnValue(new Promise<void>((r) => (finish = r)));
    renderWithProviders(<GuideEntryFormDialog open onClose={onClose} initialEntry={existing} />);

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("button", { name: "Saving..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();

    finish();
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("closes when Cancel is clicked and nothing was saved", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProviders(<GuideEntryFormDialog open onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(upsertGuideEntry).not.toHaveBeenCalled();
  });
});
