import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeAppUser, makeChatMessage } from "../../../test/factories";
import { useAuth } from "../../auth/context/AuthContext";
import { sendChatMessage, subscribeToChatMessages } from "../services/chat.service";
import type { ChatMessage } from "../types/chat.types";
import { LoungeChatProvider, useLoungeChat } from "./LoungeChatContext";

vi.mock("../../auth/context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../services/chat.service");

const NOW = new Date("2026-01-01T12:00:00");

type Callbacks = { onData: (m: ChatMessage[]) => void; onError: (e: Error) => void };

function setUser(user: ReturnType<typeof makeAppUser> | null) {
  vi.mocked(useAuth).mockReturnValue({ user } as unknown as ReturnType<typeof useAuth>);
}

function setup(user: ReturnType<typeof makeAppUser> | null = makeAppUser()) {
  const subscriptions: Callbacks[] = [];
  const unsubscribe = vi.fn();
  vi.mocked(subscribeToChatMessages).mockImplementation((onData, onError) => {
    subscriptions.push({ onData, onError });
    return unsubscribe;
  });
  setUser(user);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <LoungeChatProvider>{children}</LoungeChatProvider>
  );
  const hook = renderHook(() => useLoungeChat(), { wrapper });
  const latest = () => subscriptions[subscriptions.length - 1];
  return { ...hook, subscriptions, unsubscribe, latest, wrapper };
}

const later = (ms: number) => new Date(NOW.getTime() + ms);

describe("LoungeChatProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("starts closed and loading, then becomes ready when messages arrive", () => {
    const { result, latest } = setup();

    expect(result.current).toMatchObject({ isOpen: false, status: "loading", unreadCount: 0 });

    act(() => latest().onData([makeChatMessage()]));

    expect(result.current.status).toBe("ready");
    expect(result.current.messages).toHaveLength(1);
  });

  it("reports an error status when the subscription fails", () => {
    const { result, latest } = setup();

    act(() => latest().onError(new Error("denied")));

    expect(result.current.status).toBe("error");
  });

  it("does not subscribe while signed out", () => {
    setup(null);

    expect(subscribeToChatMessages).not.toHaveBeenCalled();
  });

  it("unsubscribes when the provider unmounts", () => {
    const { unmount, unsubscribe } = setup();

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("counts only other people's messages that arrived while closed", () => {
    const { result, latest } = setup();

    act(() =>
      latest().onData([
        makeChatMessage({ id: "old", userId: "user-2", createdAt: later(-60_000) }),
        makeChatMessage({ id: "mine", userId: "user-1", createdAt: later(1_000) }),
        makeChatMessage({ id: "theirs-1", userId: "user-2", createdAt: later(2_000) }),
        makeChatMessage({ id: "theirs-2", userId: "user-3", createdAt: later(3_000) }),
      ]),
    );

    expect(result.current.unreadCount).toBe(2);
  });

  it("opening the chat clears the unread count and new messages stay read while open", () => {
    const { result, latest } = setup();
    const unread = makeChatMessage({ id: "a", createdAt: later(1_000) });
    act(() => latest().onData([unread]));
    expect(result.current.unreadCount).toBe(1);

    act(() => result.current.open());

    expect(result.current.isOpen).toBe(true);
    expect(result.current.unreadCount).toBe(0);

    vi.setSystemTime(later(10_000));
    act(() =>
      latest().onData([unread, makeChatMessage({ id: "b", createdAt: later(9_000) })]),
    );
    expect(result.current.unreadCount).toBe(0);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.unreadCount).toBe(0);
  });

  it("toggle flips the open state", () => {
    const { result } = setup();

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it("resets messages, unread count and open state when the user changes", () => {
    const { result, latest, rerender } = setup(makeAppUser({ uid: "user-1" }));
    act(() => latest().onData([makeChatMessage({ createdAt: later(1_000) })]));
    act(() => result.current.open());
    act(() => result.current.close());
    act(() => latest().onData([makeChatMessage({ createdAt: later(2_000) })]));
    act(() => result.current.open());

    setUser(makeAppUser({ uid: "user-9" }));
    vi.setSystemTime(later(5_000));
    rerender();

    expect(result.current.messages).toEqual([]);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.status).toBe("loading");
  });

  it("resets everything and unsubscribes when the user signs out", () => {
    const { result, latest, rerender, unsubscribe } = setup();
    act(() => latest().onData([makeChatMessage({ createdAt: later(1_000) })]));
    expect(result.current.unreadCount).toBe(1);

    setUser(null);
    rerender();

    expect(unsubscribe).toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.isOpen).toBe(false);
  });

  it("send posts the text as the signed-in user", async () => {
    const { result } = setup(makeAppUser({ uid: "user-1", displayName: "Arthur Dent" }));

    await act(() => result.current.send("hello"));

    expect(sendChatMessage).toHaveBeenCalledWith({
      userId: "user-1",
      displayName: "Arthur Dent",
      text: "hello",
    });
  });

  it("send falls back to 'Hitchhiker' when the user has no display name", async () => {
    const { result } = setup(makeAppUser({ displayName: "" }));

    await act(() => result.current.send("hello"));

    expect(vi.mocked(sendChatMessage).mock.calls[0][0].displayName).toBe("Hitchhiker");
  });

  it("send throws when signed out and does not write", async () => {
    const { result } = setup(null);

    await expect(result.current.send("hello")).rejects.toThrow(
      "You must be signed in to chat.",
    );
    expect(sendChatMessage).not.toHaveBeenCalled();
  });
});

describe("useLoungeChat", () => {
  it("fails with a clear message outside of the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useLoungeChat())).toThrow(
      "useLoungeChat must be used inside LoungeChatProvider.",
    );
  });
});
