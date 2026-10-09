import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuidePage } from "./GuidePage";
import { useGuideEntries } from "../hooks/useGuideEntries";
import type { GuideEntry } from "../types/guide.types";

vi.mock("../hooks/useGuideEntries");

const mockedUseGuideEntries = vi.mocked(useGuideEntries);

const entries: GuideEntry[] = [
  {
    id: "1",
    name: "Earth",
    category: "planet",
    summary: "Mostly harmless.",
    classification: "mostly-harmless",
    tags: ["sol system", "terra"],
  },
  {
    id: "2",
    name: "Babel Fish",
    category: "species",
    summary: "A small yellow leech-like fish that translates any language.",
    classification: "legendary",
    tags: ["language", "translation"],
  },
];

function mockQueryResult(overrides: Record<string, unknown> = {}) {
  const result = {
    data: entries,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
  mockedUseGuideEntries.mockReturnValue(
    result as unknown as ReturnType<typeof useGuideEntries>,
  );
  return result;
}

describe("GuidePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading state while entries are fetched", () => {
    mockQueryResult({ data: undefined, isLoading: true });

    render(<GuidePage />);

    expect(screen.getByText("Loading entries...")).toBeInTheDocument();
  });

  it("renders the fetched entries with a count", () => {
    mockQueryResult();

    render(<GuidePage />);

    expect(screen.getByText("Earth")).toBeInTheDocument();
    expect(screen.getByText("Babel Fish")).toBeInTheDocument();
    expect(screen.getByText("2 guide entries")).toBeInTheDocument();
  });

  it("filters entries by search text", async () => {
    const user = userEvent.setup();
    mockQueryResult();

    render(<GuidePage />);

    await user.type(
      screen.getByPlaceholderText("Search planets, species, places..."),
      "babel",
    );

    expect(screen.queryByText("Earth")).not.toBeInTheDocument();
    expect(screen.getByText("Babel Fish")).toBeInTheDocument();
    expect(screen.getByText("1 guide entry")).toBeInTheDocument();
  });

  it("filters entries by category", async () => {
    const user = userEvent.setup();
    mockQueryResult();

    render(<GuidePage />);

    await user.click(screen.getByRole("button", { name: "Species" }));

    expect(screen.queryByText("Earth")).not.toBeInTheDocument();
    expect(screen.getByText("Babel Fish")).toBeInTheDocument();
  });

  it("shows an empty state and lets the user clear filters", async () => {
    const user = userEvent.setup();
    mockQueryResult();

    render(<GuidePage />);

    await user.type(
      screen.getByPlaceholderText("Search planets, species, places..."),
      "vogon poetry",
    );

    expect(screen.getByText("No Guide entries found")).toBeInTheDocument();

    await user.click(
      screen.getAllByRole("button", { name: "Clear filters" })[0],
    );

    expect(screen.getByText("Earth")).toBeInTheDocument();
    expect(screen.getByText("Babel Fish")).toBeInTheDocument();
  });

  it("shows an error alert and retries on demand", async () => {
    const user = userEvent.setup();
    const { refetch } = mockQueryResult({
      data: undefined,
      isError: true,
      error: new Error("The Guide has been demolished."),
    });

    render(<GuidePage />);

    expect(
      screen.getByText("The Guide is temporarily unavailable"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The Guide has been demolished."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(refetch).toHaveBeenCalledOnce();
  });
});
