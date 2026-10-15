import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChevronDown, ChevronUp, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../../../auth/context/AuthContext";
import { useLoungeChat } from "../../context/LoungeChatContext";
import { CHAT_MESSAGE_MAX } from "../../types/chat.types";

export const LOUNGE_NAME = "The Restaurant at the End of the Universe";

export function LoungeChatDock() {
  const { user } = useAuth();
  const { messages, status, isOpen, unreadCount, toggle, close, send } =
    useLoungeChat();

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement | null>(null);
  const headerButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  // Escape closes panel and returns focus to header toggle
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        headerButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    try {
      setSending(true);
      setError(null);
      await send(text);
      setDraft("");
    } catch {
      setError("Couldn’t send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const latestMessage = messages[messages.length - 1];
  const hasNewIncoming =
    latestMessage &&
    latestMessage.id !== lastMessageIdRef.current &&
    latestMessage.userId !== user?.uid;

  useEffect(() => {
    if (!latestMessage) return;
    lastMessageIdRef.current = latestMessage.id;
  }, [latestMessage]);

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 0,
        right: { xs: 8, sm: 24 },
        width: { xs: "calc(100vw - 16px)", sm: 340 },
        zIndex: (theme) => theme.zIndex.appBar + 1, // above app bar/content
        // keep below dialog (default modal ~1300)
        borderRadius: "12px 12px 0 0",
        border: "1px solid rgba(255,255,255,.12)",
        borderBottom: 0,
        overflow: "hidden",
      }}
    >
      <Box
        ref={headerButtonRef}
        component="button"
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="lounge-chat-panel"
        aria-label={isOpen ? "Minimize lounge chat" : "Open lounge chat"}
        sx={{
          all: "unset",
          boxSizing: "border-box",
          width: "100%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "action.hover" },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "secondary.main",
          },
        }}
      >
        <Badge color="secondary" badgeContent={unreadCount} max={9}>
          <MessageCircle size={20} />
        </Badge>
        <Typography
          variant="subtitle2"
          noWrap
          sx={{ flexGrow: 1, fontWeight: 700 }}
        >
          {LOUNGE_NAME}
        </Typography>
        {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </Box>

      {isOpen ? (
        <Box
          id="lounge-chat-panel"
          role="region"
          aria-label={LOUNGE_NAME}
          sx={{ borderTop: "1px solid rgba(255,255,255,.08)" }}
        >
          {/* SR-only polite announcement for new incoming messages */}
          <Box
            aria-live="polite"
            aria-atomic="true"
            sx={{
              position: "absolute",
              width: 1,
              height: 1,
              p: 0,
              m: -1,
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          >
            {hasNewIncoming
              ? `${latestMessage.displayName} sent a new message.`
              : ""}
          </Box>

          <Box
            ref={listRef}
            sx={{ height: { xs: 320, sm: 360 }, overflowY: "auto", p: 1.5 }}
          >
            {status === "loading" ? (
              <Box
                sx={{ display: "grid", placeItems: "center", height: "100%" }}
              >
                <CircularProgress size={22} />
              </Box>
            ) : status === "error" ? (
              <Alert severity="error">
                We couldn’t reach the lounge right now.
              </Alert>
            ) : messages.length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ p: 1 }}>
                It’s quiet in here. Be the first to say something. Don’t panic.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {messages.map((message) => {
                  const mine = message.userId === user?.uid;
                  return (
                    <Box
                      key={message.id}
                      sx={{
                        alignSelf: mine ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                      }}
                    >
                      {!mine ? (
                        <Typography variant="caption" color="secondary.main">
                          {message.displayName}
                        </Typography>
                      ) : null}
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 2,
                          bgcolor: mine ? "secondary.main" : "action.selected",
                          color: mine
                            ? "secondary.contrastText"
                            : "text.primary",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {message.text}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          textAlign: mine ? "right" : "left",
                        }}
                      >
                        {message.createdAt.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>

          {error ? (
            <Alert severity="error" sx={{ mx: 1.5, mb: 1 }}>
              {error}
            </Alert>
          ) : null}

          <Stack
            component="form"
            direction="row"
            spacing={1}
            onSubmit={handleSubmit}
            sx={{ p: 1.5, borderTop: "1px solid rgba(255,255,255,.08)" }}
          >
            <TextField
              inputRef={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Say something to the lounge…"
              size="small"
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: CHAT_MESSAGE_MAX,
                  "aria-label": "Chat message",
                },
              }}
              helperText={`${draft.length}/${CHAT_MESSAGE_MAX}`}
            />
            <IconButton
              type="submit"
              color="secondary"
              aria-label="Send message"
              disabled={sending || !draft.trim()}
            >
              <Send size={18} />
            </IconButton>
          </Stack>
        </Box>
      ) : null}
    </Paper>
  );
}
