import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../auth/context/AuthContext";
import { createTravelTaskFromGuideEntry } from "../../travelTasks/services/travelTasks.service";
import { makeAppUser, makeGuideEntry } from "../../../test/factories";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { getGuideEntryById } from "../services/guide.service";
import { GuideEntryPage } from "./GuideEntryPage";

vi.mock("../../auth/context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../services/guide.service");
vi.mock("../../travelTasks/services/travelTasks.service");

function renderPage(entryId = "earth") {
  return renderWithProviders(
    <Routes>
      <Route path="/guide/:entryId" element={<GuideEntryPage />} />
      <Route path="/guide" element={<div>Guide list</div>} />
    </Routes>,
    { route: `/guide/${entryId}` },
  );
}

describe("GuideEntryPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: makeAppUser() } as unknown as ReturnType<
      typeof useAuth
    >);
  });

  it("shows a loading state, then the entry's name, summary, classification and tags", async () => {
    vi.mocked(getGuideEntryById).mockResolvedValue(
      makeGuideEntry({ name: "Earth", summary: "Mostly harmless.", classification: "caution", tags: ["terra"] }),
    );
    renderPage();

    expect(screen.getByText("Loading Guide entry…")).toBeInTheDocument();

    expect(await screen.findByRole("heading", { name: "Earth" })).toBeInTheDocument();
    expect(screen.getByText("Mostly harmless.")).toBeInTheDocument();
    expect(screen.getByText("Caution advised")).toBeInTheDocument();
    expect(screen.getByText("terra")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Guide" })).toHaveAttribute("href", "/guide");
  });

  it("omits the description and travel advisory when the entry has neither", async () => {
    vi.mocked(getGuideEntryById).mockResolvedValue(makeGuideEntry());
    renderPage();

    await screen.findByRole("heading", { name: "Earth" });

    expect(screen.queryByText("Travel advisory")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the description and travel advisory when present", async () => {
    vi.mocked(getGuideEntryById).mockResolvedValue(
      makeGuideEntry({
        description: "A blue-green planet with oceans.",
        travelAdvisory: "Beware of Vogon demolition crews.",
      }),
    );
    renderPage();

    expect(await screen.findByText("A blue-green planet with oceans.")).toBeInTheDocument();
    expect(screen.getByText("Travel advisory")).toBeInTheDocument();
    expect(screen.getByText("Beware of Vogon demolition crews.")).toBeInTheDocument();
  });

  it("tells the user when the entry does not exist", async () => {
    vi.mocked(getGuideEntryById).mockResolvedValue(null);
    renderPage("missing");

    expect(
      await screen.findByText("This Guide entry does not exist (or is no longer available)."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Guide" })).toBeInTheDocument();
  });

  it("shows a generic error and retries when loading fails", async () => {
    const user = userEvent.setup();
    vi.mocked(getGuideEntryById)
      .mockRejectedValueOnce(new Error("internal secret"))
      .mockResolvedValue(makeGuideEntry({ name: "Earth" }));
    renderPage();

    expect(
      await screen.findByText("We couldn’t load this Guide entry right now."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/internal secret/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("heading", { name: "Earth" })).toBeInTheDocument();
  });

  it("adds the entry to the checklist and confirms", async () => {
    const user = userEvent.setup();
    const entry = makeGuideEntry({ name: "Earth" });
    vi.mocked(getGuideEntryById).mockResolvedValue(entry);
    renderPage();

    await user.click(await screen.findByRole("button", { name: "Add to checklist" }));

    expect(await screen.findByText('Added "Earth" to your checklist.')).toBeInTheDocument();
    expect(createTravelTaskFromGuideEntry).toHaveBeenCalledWith("user-1", entry);
  });

  it("shows a generic message when adding to the checklist fails", async () => {
    const user = userEvent.setup();
    vi.mocked(getGuideEntryById).mockResolvedValue(makeGuideEntry());
    vi.mocked(createTravelTaskFromGuideEntry).mockRejectedValue(new Error("raw"));
    renderPage();

    await user.click(await screen.findByRole("button", { name: "Add to checklist" }));

    expect(
      await screen.findByText("Couldn’t add this entry to your checklist. Please try again."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/raw/)).not.toBeInTheDocument();
  });
});
