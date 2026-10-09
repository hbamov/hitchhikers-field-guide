import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GuideCard } from "./GuideCard";
import type { GuideEntry } from "../types/guide.types";

const entry: GuideEntry = {
  id: "1",
  name: "Babel Fish",
  category: "species",
  summary: "A small yellow leech-like fish that translates any language.",
  classification: "legendary",
  tags: ["language", "translation", "yellow", "improbable"],
};

describe("GuideCard", () => {
  it("renders the entry name, summary, and category", () => {
    render(<GuideCard entry={entry} />);

    expect(
      screen.getByRole("heading", { name: "Babel Fish" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/small yellow leech-like fish/i),
    ).toBeInTheDocument();
    expect(screen.getByText("species")).toBeInTheDocument();
  });

  it("renders the human-readable classification label", () => {
    render(<GuideCard entry={entry} />);

    expect(screen.getByText("Legendary")).toBeInTheDocument();
  });

  it("shows at most three tags", () => {
    render(<GuideCard entry={entry} />);

    expect(screen.getByText("language")).toBeInTheDocument();
    expect(screen.getByText("translation")).toBeInTheDocument();
    expect(screen.getByText("yellow")).toBeInTheDocument();
    expect(screen.queryByText("improbable")).not.toBeInTheDocument();
  });

  it("renders a disabled 'coming soon' button", () => {
    render(<GuideCard entry={entry} />);

    expect(
      screen.getByRole("button", { name: /full entry coming soon/i }),
    ).toBeDisabled();
  });
});
