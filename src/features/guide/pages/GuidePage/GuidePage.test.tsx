import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../../auth/context/AuthContext";
import { createTravelTaskFromGuideEntry } from "../../../travelTasks/services/travelTasks.service";
import { makeAppUser, makeGuideEntry } from "../../../../test/factories";
import { renderWithProviders } from "../../../../test/renderWithProviders";
import { getGuideEntries } from "../../services/guide.service";
import { GuidePage } from "./GuidePage";

vi.mock("../../auth/context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../services/guide.service");
vi.mock("../../travelTasks/services/travelTasks.service");

const earth = makeGuideEntry({
  id: "earth",
  name: "Earth",
  summary: "Mostly harmless.",
  tags: ["sol system", "terra"],
});
const fish = makeGuideEntry({
  id: "fish",
  name: "Babel Fish",
  category: "species",
  summary: "Translates any language.",
  classification: "legendary",
  tags: ["linguistics"],
});

const searchBox = () => screen.getByRole("searchbox");

describe("GuidePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: makeAppUser(),
    } as unknown as ReturnType<typeof useAuth>);
    vi.mocked(getGuideEntries).mockResolvedValue([earth, fish]);
  });

  it("shows loading placeholders, then the entries with a count", async () => {
    renderWithProviders(<GuidePage />);

    expect(screen.getByText("Loading entries...")).toBeInTheDocument();

    expect(
      await screen.findByRole("heading", { name: "Earth" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Babel Fish" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 guide entries")).toBeInTheDocument();
  });

  it("shows a generic error and retries when the user clicks 'Try again'", async () => {
    const user = userEvent.setup();
    vi.mocked(getGuideEntries).mockRejectedValueOnce(
      new Error("firestore: secret detail"),
    );
    renderWithProviders(<GuidePage />);

    expect(
      await screen.findByText("The Guide is temporarily unavailable"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/secret detail/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", { name: "Earth" }),
    ).toBeInTheDocument();
    expect(getGuideEntries).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["name", "babel"],
    ["summary", "translates"],
    ["tag", "SOL SYSTEM"],
  ])("filters entries by %s (case-insensitive)", async (_field, term) => {
    const user = userEvent.setup();
    renderWithProviders(<GuidePage />);
    await screen.findByRole("heading", { name: "Earth" });

    await user.type(searchBox(), term);

    const expected =
      term.toLowerCase() === "sol system" ? "Earth" : "Babel Fish";
    const other = expected === "Earth" ? "Babel Fish" : "Earth";
    expect(screen.getByRole("heading", { name: expected })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: other }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("1 guide entry")).toBeInTheDocument();
  });

  it("filters entries by category chip", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GuidePage />);
    await screen.findByRole("heading", { name: "Earth" });

    await user.click(screen.getByRole("button", { name: "Species" }));

    expect(
      screen.getByRole("heading", { name: "Babel Fish" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Earth" }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty message and 'Clear filters' restores every entry", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GuidePage />);
    await screen.findByRole("heading", { name: "Earth" });

    await user.type(searchBox(), "vogon poetry");
    await user.click(screen.getByRole("button", { name: "Technology" }));

    expect(screen.getByText("No Guide entries found")).toBeInTheDocument();

    await user.click(
      screen.getAllByRole("button", { name: "Clear filters" })[0],
    );

    expect(searchBox()).toHaveValue("");
    expect(screen.getByRole("heading", { name: "Earth" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Babel Fish" }),
    ).toBeInTheDocument();
  });

  it("clears only the search text with the clear-search button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GuidePage />);
    await screen.findByRole("heading", { name: "Earth" });
    await user.type(searchBox(), "babel");

    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(searchBox()).toHaveValue("");
    expect(screen.getByRole("heading", { name: "Earth" })).toBeInTheDocument();
  });

  it("adds an entry to the checklist and confirms with a message", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GuidePage />);
    await screen.findByRole("heading", { name: "Earth" });

    await user.click(
      screen.getAllByRole("button", { name: "Add to checklist" })[0],
    );

    expect(
      await screen.findByText('Added "Earth" to your checklist.'),
    ).toBeInTheDocument();
    expect(createTravelTaskFromGuideEntry).toHaveBeenCalledWith(
      "user-1",
      earth,
    );
  });

  it("shows an error message when adding to the checklist fails", async () => {
    const user = userEvent.setup();
    vi.mocked(createTravelTaskFromGuideEntry).mockRejectedValue(
      new Error("raw firestore error"),
    );
    renderWithProviders(<GuidePage />);
    await screen.findByRole("heading", { name: "Earth" });

    await user.click(
      screen.getAllByRole("button", { name: "Add to checklist" })[0],
    );

    expect(
      await screen.findByText(
        "Couldn’t add this entry to your checklist. Please try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/raw firestore error/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Added /)).not.toBeInTheDocument();
  });
});
