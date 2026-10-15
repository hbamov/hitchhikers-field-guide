import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeGuideEntry } from "../../../test/factories";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { GuideCard } from "./GuideCard";

const entry = makeGuideEntry({
  id: "babel-fish",
  name: "Babel Fish",
  category: "species",
  summary: "A small yellow leech-like fish that translates any language.",
  classification: "legendary",
  tags: ["language", "translation", "yellow", "improbable"],
});

describe("GuideCard", () => {
  it("shows the entry name, summary, category and readable classification", () => {
    renderWithProviders(<GuideCard entry={entry} onAddToChecklist={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Babel Fish" })).toBeInTheDocument();
    expect(screen.getByText(/small yellow leech-like fish/i)).toBeInTheDocument();
    expect(screen.getByText("species")).toBeInTheDocument();
    expect(screen.getByText("Legendary")).toBeInTheDocument();
  });

  it.each([
    ["mostly-harmless", "Mostly harmless"],
    ["caution", "Caution advised"],
    ["unknown", "Unknown"],
  ] as const)("labels the %s classification as '%s'", (classification, label) => {
    renderWithProviders(
      <GuideCard entry={{ ...entry, classification }} onAddToChecklist={vi.fn()} />,
    );

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("shows at most three tags", () => {
    renderWithProviders(<GuideCard entry={entry} onAddToChecklist={vi.fn()} />);

    expect(screen.getByText("yellow")).toBeInTheDocument();
    expect(screen.queryByText("improbable")).not.toBeInTheDocument();
  });

  it("links to the full entry page", () => {
    renderWithProviders(<GuideCard entry={entry} onAddToChecklist={vi.fn()} />);

    expect(screen.getByRole("link", { name: "View full entry" })).toHaveAttribute(
      "href",
      "/guide/babel-fish",
    );
  });

  it("adds the entry to the checklist when the button is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(<GuideCard entry={entry} onAddToChecklist={onAdd} />);

    await user.click(screen.getByRole("button", { name: "Add to checklist" }));

    expect(onAdd).toHaveBeenCalledWith(entry);
  });

  it("disables the add button while adding", () => {
    renderWithProviders(
      <GuideCard entry={entry} onAddToChecklist={vi.fn()} addingToChecklist />,
    );

    expect(screen.getByRole("button", { name: "Adding..." })).toBeDisabled();
  });
});
