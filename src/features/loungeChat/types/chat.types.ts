export const CHAT_MESSAGE_MAX = 500;

export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: Date;
}
