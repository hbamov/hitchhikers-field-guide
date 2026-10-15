import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../../shared/firebase/firebase";
import { CHAT_MESSAGE_MAX, type ChatMessage } from "../types/chat.types";

const MESSAGE_LIMIT = 50;

export function subscribeToChatMessages(
  onData: (messages: ChatMessage[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  if (!db) {
    onError(new Error("Firebase Firestore is not initialized."));
    return () => {};
  }

  const messagesQuery = query(
    collection(db, "chatMessages"),
    orderBy("createdAt", "desc"),
    limit(MESSAGE_LIMIT),
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages: ChatMessage[] = [];

      for (const messageDoc of snapshot.docs) {
        // "estimate" avoids null timestamps for our own pending writes
        const data = messageDoc.data({ serverTimestamps: "estimate" });

        const userId = typeof data.userId === "string" ? data.userId : "";
        const text = typeof data.text === "string" ? data.text.trim() : "";
        const createdAt = data.createdAt?.toDate?.();

        // Skip anything that couldn't have been created through the app
        if (!userId || !text || !(createdAt instanceof Date)) continue;

        messages.push({
          id: messageDoc.id,
          userId,
          displayName:
            typeof data.displayName === "string" && data.displayName.trim()
              ? data.displayName
              : "Hitchhiker",
          text,
          createdAt,
        });
      }

      onData(messages.reverse()); // oldest -> newest
    },
    (error) => onError(error),
  );
}

export async function sendChatMessage(params: {
  userId: string;
  displayName: string;
  text: string;
}): Promise<void> {
  if (!db) throw new Error("Firebase Firestore is not initialized.");

  const text = params.text.trim();
  if (!text || text.length > CHAT_MESSAGE_MAX)
    throw new Error("Invalid message.");

  await addDoc(collection(db, "chatMessages"), {
    userId: params.userId,
    displayName: params.displayName.trim().slice(0, 60) || "Hitchhiker",
    text,
    createdAt: serverTimestamp(),
  });
}
