import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeGuideEntry } from "../../../test/factories";
import { renderWithProviders } from "../../../test/renderWithProviders";
import {
  getGuideEntries,
  removeGuideEntry,
} from "../../guide/services/guide.service";
import { AdminGuidePage } from "./AdminGuidePage";

vi.mock("../../guide/services/guide.service");

const earth = makeGuideEntry({ id: "earth", name: "Earth" });
const fish = makeGuideEntry({
  id: "babel-fish",
  name: "Babel Fish",
  category: "species",
  classification: "legendary",
});

describe("AdminGuidePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getGuideEntries).mockResolvedValue([earth, fish]);
  });

  it("shows a loading state, then entries sorted by name with their metadata", async () => {
    renderWithProviders(<AdminGuidePage />);
    expect(screen.getByText("Loading entries…")).toBeInTheDocument();

    expect(await screen.findByText("Babel Fish")).toBeInTheDocument();

    const names = screen.getAllByRole("button", { name: "Edit" });
    expect(names).toHaveLength(2);
    expect(screen.getByText("babel-fish · species · legendary")).toBeInTheDocument();
    expect(
      screen.getByText("Babel Fish").compareDocumentPosition(screen.getByText("Earth")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows an empty message when there are no entries", async () => {
    vi.mocked(getGuideEntries).mockResolvedValue([]);
    renderWithProviders(<AdminGuidePage />);

    expect(await screen.findByText("No Guide entries found.")).toBeInTheDocument();
  });

  it("shows an error and retries loading", async () => {
    const user = userEvent.setup();
    vi.mocked(getGuideEntries).mockRejectedValueOnce(new Error("denied"));
    renderWithProviders(<AdminGuidePage />);

    expect(await screen.findByText("Couldn’t load Guide entries.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Earth")).toBeInTheDocument();
  });

  it("opens an empty create dialog from the create button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminGuidePage />);
    await screen.findByText("Earth");

    await user.click(screen.getByRole("button", { name: "Create Guide entry" }));

    const dialog = await screen.findByRole("dialog", { name: "Create Guide entry" });
    expect(within(dialog).getByLabelText("Entry ID")).toHaveValue("");
    expect(within(dialog).getByLabelText("Entry ID")).toBeEnabled();
  });

  it("opens the edit dialog prefilled with the chosen entry, then closes it on cancel", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminGuidePage />);
    await screen.findByText("Earth");

    const row = screen.getByText("Earth").closest("div")!.parentElement!;
    await user.click(within(row).getByRole("button", { name: "Edit" }));

    const dialog = await screen.findByRole("dialog", { name: "Edit Guide entry" });
    expect(within(dialog).getByLabelText("Name")).toHaveValue("Earth");

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await vi.waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("asks for confirmation before deleting and deletes the chosen entry", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminGuidePage />);
    await screen.findByText("Earth");

    const row = screen.getByText("Earth").closest("div")!.parentElement!;
    await user.click(within(row).getByRole("button", { name: "Delete" }));

    const dialog = await screen.findByRole("dialog", { name: "Delete Guide entry?" });
    expect(dialog).toHaveTextContent("“Earth” will be permanently removed.");
    expect(removeGuideEntry).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(removeGuideEntry).toHaveBeenCalledWith("earth");
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("does not delete when the confirmation is cancelled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminGuidePage />);
    await screen.findByText("Earth");

    const row = screen.getByText("Earth").closest("div")!.parentElement!;
    await user.click(within(row).getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    expect(removeGuideEntry).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows a generic error and keeps the dialog open when deleting fails", async () => {
    const user = userEvent.setup();
    vi.mocked(removeGuideEntry).mockRejectedValue(new Error("permission-denied raw"));
    renderWithProviders(<AdminGuidePage />);
    await screen.findByText("Earth");

    const row = screen.getByText("Earth").closest("div")!.parentElement!;
    await user.click(within(row).getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(await within(dialog).findByText("Couldn’t delete Guide entry. Please try again.")).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent("raw");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("disables the dialog buttons while the delete is in flight", async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    vi.mocked(removeGuideEntry).mockReturnValue(new Promise<void>((r) => (finish = r)));
    renderWithProviders(<AdminGuidePage />);
    await screen.findByText("Earth");

    const row = screen.getByText("Earth").closest("div")!.parentElement!;
    await user.click(within(row).getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(await within(dialog).findByRole("button", { name: "Deleting..." })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeDisabled();
    finish();
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
