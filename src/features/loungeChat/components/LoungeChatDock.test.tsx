import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAppUser, makeChatMessage } from "../../../test/factories";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { useAuth } from "../../auth/context/AuthContext";
import { useLoungeChat } from "../context/LoungeChatContext";
import { LoungeChatDock, LOUNGE_NAME } from "./LoungeChatDock";

vi.mock("../../auth/context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../context/LoungeChatContext", () => ({ useLoungeChat: vi.fn() }));

const toggle = vi.fn();
const close = vi.fn();
const send = vi.fn();

function mockChat(overrides: Partial<ReturnType<typeof useLoungeChat>> = {}) {
  vi.mocked(useLoungeChat).mockReturnValue({
    messages: [],
    status: "ready",
    isOpen: true,
    unreadCount: 0,
    open: vi.fn(),
    close,
    toggle,
    send,
    ...overrides,
  });
}

describe("LoungeChatDock", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: makeAppUser({ uid: "user-1" }),
    } as ReturnType<typeof useAuth>);
    send.mockResolvedValue(undefined);
    mockChat();
  });

  it("is minimized by default: only the header is shown", () => {
    mockChat({ isOpen: false });
    renderWithProviders(<LoungeChatDock />);

    const header = screen.getByRole("button", { name: "Open lounge chat" });
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(LOUNGE_NAME)).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: LOUNGE_NAME })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Chat message" })).not.toBeInTheDocument();
  });

  it("toggles when the header is clicked", async () => {
    const user = userEvent.setup();
    mockChat({ isOpen: false });
    renderWithProviders(<LoungeChatDock />);

    await user.click(screen.getByRole("button", { name: "Open lounge chat" }));

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it("shows the unread badge on the minimized bar", () => {
    mockChat({ isOpen: false, unreadCount: 4 });
    renderWithProviders(<LoungeChatDock />);

    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("caps the unread badge at 9+", () => {
    mockChat({ isOpen: false, unreadCount: 25 });
    renderWithProviders(<LoungeChatDock />);

    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("opens with the input focused and shows an expanded header", () => {
    renderWithProviders(<LoungeChatDock />);

    expect(screen.getByRole("button", { name: "Minimize lounge chat" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "Chat message" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to the header button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoungeChatDock />);

    await user.keyboard("{Escape}");

    expect(close).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Minimize lounge chat" })).toHaveFocus();
  });

  it("does not react to Escape while minimized", async () => {
    const user = userEvent.setup();
    mockChat({ isOpen: false });
    renderWithProviders(<LoungeChatDock />);

    await user.keyboard("{Escape}");

    expect(close).not.toHaveBeenCalled();
  });

  it("sends the trimmed text and clears the input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoungeChatDock />);
    const input = screen.getByRole("textbox", { name: "Chat message" });

    await user.type(input, "  Don't panic  ");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(send).toHaveBeenCalledWith("Don't panic");
    await vi.waitFor(() => expect(input).toHaveValue(""));
  });

  it("sends with the Enter key", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoungeChatDock />);

    await user.type(screen.getByRole("textbox", { name: "Chat message" }), "Hello{Enter}");

    expect(send).toHaveBeenCalledWith("Hello");
  });

  it("disables the send button for an empty or whitespace-only draft", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoungeChatDock />);
    const sendButton = screen.getByRole("button", { name: "Send message" });

    expect(sendButton).toBeDisabled();
    await user.type(screen.getByRole("textbox", { name: "Chat message" }), "   ");
    expect(sendButton).toBeDisabled();
    await user.type(screen.getByRole("textbox", { name: "Chat message" }), "hi");
    expect(sendButton).toBeEnabled();
  });

  it("shows a generic error and keeps the draft when sending fails", async () => {
    const user = userEvent.setup();
    send.mockRejectedValue(new Error("permission-denied"));
    renderWithProviders(<LoungeChatDock />);
    const input = screen.getByRole("textbox", { name: "Chat message" });

    await user.type(input, "Hello");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(
      await screen.findByText("Couldn’t send your message. Please try again."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/permission-denied/)).not.toBeInTheDocument();
    expect(input).toHaveValue("Hello");
  });

  it("shows a character counter for the draft", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoungeChatDock />);

    await user.type(screen.getByRole("textbox", { name: "Chat message" }), "abc");

    expect(screen.getByText("3/500")).toBeInTheDocument();
  });

  it("labels other users' messages with their name but not the user's own", () => {
    mockChat({
      messages: [
        makeChatMessage({ id: "1", userId: "user-2", displayName: "Ford Prefect", text: "Towel?" }),
        makeChatMessage({ id: "2", userId: "user-1", displayName: "Arthur Dent", text: "Yes." }),
      ],
    });
    renderWithProviders(<LoungeChatDock />);

    const region = screen.getByRole("region", { name: LOUNGE_NAME });
    expect(within(region).getByText("Ford Prefect")).toBeInTheDocument();
    expect(within(region).getByText("Towel?")).toBeInTheDocument();
    expect(within(region).getByText("Yes.")).toBeInTheDocument();
    expect(within(region).queryByText("Arthur Dent")).not.toBeInTheDocument();
  });

  it("announces new incoming messages from other users", () => {
    mockChat({
      messages: [makeChatMessage({ userId: "user-2", displayName: "Ford Prefect" })],
    });
    renderWithProviders(<LoungeChatDock />);

    expect(screen.getByText("Ford Prefect sent a new message.")).toBeInTheDocument();
  });

  it("does not announce the user's own messages", () => {
    mockChat({
      messages: [makeChatMessage({ userId: "user-1", displayName: "Arthur Dent" })],
    });
    renderWithProviders(<LoungeChatDock />);

    expect(screen.queryByText(/sent a new message/)).not.toBeInTheDocument();
  });

  it("shows an empty, loading and error state inside the panel", () => {
    mockChat();
    const first = renderWithProviders(<LoungeChatDock />);
    expect(screen.getByText(/It’s quiet in here/)).toBeInTheDocument();
    first.unmount();

    mockChat({ status: "loading" });
    const second = renderWithProviders(<LoungeChatDock />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    second.unmount();

    mockChat({ status: "error" });
    renderWithProviders(<LoungeChatDock />);
    expect(screen.getByText("We couldn’t reach the lounge right now.")).toBeInTheDocument();
  });
});
