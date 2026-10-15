import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  makeAppUser,
  makeChatMessage,
  makeGuideEntry,
  makeTravelTask,
} from "../../test/factories";
import { renderWithProviders } from "../../test/renderWithProviders";
import { useAuth } from "../../features/auth/context/AuthContext";
import { getGuideEntries } from "../../features/guide/services/guide.service";
import { getTravelTasks } from "../../features/travelTasks/services/travelTasks.service";
import { useLoungeChat } from "../../features/loungeChat/context/LoungeChatContext";
import { DashboardPage } from "./DashboardPage";

vi.mock("../../features/auth/context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../../features/loungeChat/context/LoungeChatContext", () => ({
  useLoungeChat: vi.fn(),
}));
vi.mock("../../features/guide/services/guide.service");
vi.mock("../../features/travelTasks/services/travelTasks.service");

const open = vi.fn();
const toggle = vi.fn();

function mockChat(overrides: Partial<ReturnType<typeof useLoungeChat>> = {}) {
  vi.mocked(useLoungeChat).mockReturnValue({
    messages: [],
    status: "ready",
    isOpen: false,
    unreadCount: 0,
    open,
    close: vi.fn(),
    toggle,
    send: vi.fn(),
    ...overrides,
  });
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: makeAppUser({ displayName: "Arthur Dent", role: "administrator" }),
    } as ReturnType<typeof useAuth>);
    vi.mocked(getGuideEntries).mockResolvedValue([]);
    vi.mocked(getTravelTasks).mockResolvedValue([]);
    mockChat();
  });

  it("greets the user and summarises the account", () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText("Good to have you, Arthur Dent.")).toBeInTheDocument();
    expect(
      screen.getByText("You are signed in as arthur@dent.dev · role: administrator"),
    ).toBeInTheDocument();
  });

  it("falls back to a default name when the user has no display name", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: makeAppUser({ displayName: "" }),
    } as ReturnType<typeof useAuth>);
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText("Good to have you, Traveler.")).toBeInTheDocument();
  });

  it("shows the featured entry with its first tag, classification and a link to the entry", async () => {
    vi.mocked(getGuideEntries).mockResolvedValue([
      makeGuideEntry({
        id: "babel-fish",
        name: "Babel Fish",
        category: "species",
        classification: "legendary",
        tags: ["Translator", "ear"],
      }),
    ]);
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByRole("heading", { name: "Babel Fish" })).toBeInTheDocument();
    expect(screen.getByText("CLASSIFICATION: LEGENDARY")).toBeInTheDocument();
    expect(screen.getByText("TAG: translator")).toBeInTheDocument();
    expect(screen.queryByText(/TAG: ear/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View full entry/ })).toHaveAttribute(
      "href",
      "/guide/babel-fish",
    );
    expect(
      screen.getByText("Featured guide entry").parentElement?.querySelector("svg"),
    ).not.toBeNull();
  });

  it("omits the tag chip when the featured entry has no tags", async () => {
    vi.mocked(getGuideEntries).mockResolvedValue([makeGuideEntry({ tags: [] })]);
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("Earth")).toBeInTheDocument();
    expect(screen.queryByText(/^TAG:/)).not.toBeInTheDocument();
  });

  it("shows an empty message when there are no guide entries", async () => {
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("No Guide entries available yet.")).toBeInTheDocument();
  });

  it("shows a generic message when guide entries fail to load", async () => {
    vi.mocked(getGuideEntries).mockRejectedValue(new Error("permission-denied"));
    renderWithProviders(<DashboardPage />);

    expect(
      await screen.findByText("We couldn’t load featured Guide data right now."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/permission-denied/)).not.toBeInTheDocument();
  });

  it("previews only the first 3 open tasks and counts all open ones", async () => {
    vi.mocked(getTravelTasks).mockResolvedValue([
      makeTravelTask({ id: "1", title: "Task one" }),
      makeTravelTask({ id: "2", title: "Task two", status: "completed" }),
      makeTravelTask({ id: "3", title: "Task three" }),
      makeTravelTask({ id: "4", title: "Task four" }),
      makeTravelTask({ id: "5", title: "Task five" }),
    ]);
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("4 items remaining")).toBeInTheDocument();
    expect(screen.getByText("Task one")).toBeInTheDocument();
    expect(screen.getByText("Task three")).toBeInTheDocument();
    expect(screen.getByText("Task four")).toBeInTheDocument();
    expect(screen.queryByText("Task two")).not.toBeInTheDocument();
    expect(screen.queryByText("Task five")).not.toBeInTheDocument();
  });

  it("uses the singular form for a single open task", async () => {
    vi.mocked(getTravelTasks).mockResolvedValue([makeTravelTask()]);
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("1 item remaining")).toBeInTheDocument();
  });

  it("shows the empty checklist message when there are no tasks", async () => {
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("No tasks yet")).toBeInTheDocument();
  });

  it("shows an all-clear message when every task is completed", async () => {
    vi.mocked(getTravelTasks).mockResolvedValue([
      makeTravelTask({ status: "completed" }),
    ]);
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("All clear")).toBeInTheDocument();
  });

  it("shows a generic message when tasks fail to load", async () => {
    vi.mocked(getTravelTasks).mockRejectedValue(new Error("denied"));
    renderWithProviders(<DashboardPage />);

    expect(
      await screen.findByText("We couldn’t load your checklist right now."),
    ).toBeInTheDocument();
  });

  it("clicking the live lounge card opens the chat and never toggles it closed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />);

    const card = screen.getByRole("button", { name: "Open the lounge chat" });
    await user.click(card);
    await user.click(card);

    expect(open).toHaveBeenCalledTimes(2);
    expect(toggle).not.toHaveBeenCalled();
  });

  it("shows the latest three lounge messages and the unread count", () => {
    mockChat({
      unreadCount: 2,
      messages: [
        makeChatMessage({ id: "1", text: "first", displayName: "Zaphod" }),
        makeChatMessage({ id: "2", text: "second" }),
        makeChatMessage({ id: "3", text: "third" }),
        makeChatMessage({ id: "4", text: "fourth" }),
      ],
    });
    renderWithProviders(<DashboardPage />);

    expect(screen.queryByText(/first/)).not.toBeInTheDocument();
    expect(screen.getByText(/fourth/)).toBeInTheDocument();
    expect(screen.getByText("2 new")).toBeInTheDocument();
  });

  it("shows an invitation when the lounge is empty", () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByText(/Nobody has said anything yet/)).toBeInTheDocument();
    expect(screen.queryByText(/new$/)).not.toBeInTheDocument();
  });

  it("shows a loading state and an error state for the lounge", () => {
    mockChat({ status: "loading" });
    const { unmount } = renderWithProviders(<DashboardPage />);
    expect(screen.queryByText(/Nobody has said anything yet/)).not.toBeInTheDocument();
    unmount();

    mockChat({ status: "error" });
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("We couldn’t reach the lounge right now.")).toBeInTheDocument();
  });
});
