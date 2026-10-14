import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  sendChatMessage,
  subscribeToChatMessages,
} from "../services/chat.service";
import type { ChatMessage } from "../types/chat.types";

type ChatStatus = "loading" | "ready" | "error";

interface LoungeChatContextValue {
  messages: ChatMessage[];
  status: ChatStatus;
  isOpen: boolean;
  unreadCount: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  send: (text: string) => Promise<void>;
}

const LoungeChatContext = createContext<LoungeChatContextValue | null>(null);

export function LoungeChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const displayName = user?.displayName || "Hitchhiker";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("loading");
  const [isOpen, setIsOpen] = useState(false);
  // Messages older than this don't count as unread
  const [lastReadMs, setLastReadMs] = useState(() => Date.now());

  useEffect(() => {
    if (!uid) return;

    setStatus("loading");
    const unsubscribe = subscribeToChatMessages(
      (next) => {
        setMessages(next);
        setStatus("ready");
      },
      () => setStatus("error"),
    );

    return unsubscribe;
  }, [uid]);

  // While the chat is open, everything is "read"
  useEffect(() => {
    if (isOpen) setLastReadMs(Date.now());
  }, [isOpen, messages]);

  const unreadCount = useMemo(() => {
    if (isOpen) return 0;
    return messages.filter(
      (message) =>
        message.userId !== uid && message.createdAt.getTime() > lastReadMs,
    ).length;
  }, [messages, isOpen, uid, lastReadMs]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  const send = useCallback(
    async (text: string) => {
      if (!uid) throw new Error("You must be signed in to chat.");
      await sendChatMessage({ userId: uid, displayName, text });
    },
    [uid, displayName],
  );

  const value = useMemo(
    () => ({
      messages,
      status,
      isOpen,
      unreadCount,
      open,
      close,
      toggle,
      send,
    }),
    [messages, status, isOpen, unreadCount, open, close, toggle, send],
  );

  return (
    <LoungeChatContext.Provider value={value}>
      {children}
    </LoungeChatContext.Provider>
  );
}

export function useLoungeChat() {
  const context = useContext(LoungeChatContext);
  if (!context)
    throw new Error("useLoungeChat must be used inside LoungeChatProvider.");
  return context;
}
