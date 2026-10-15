import type { GuideEntry } from "../features/guide/types/guide.types";
import type { TravelTask } from "../features/travelTasks/types/travelTask.types";
import type { ChatMessage } from "../features/loungeChat/types/chat.types";
import type { AppUser } from "../shared/types/user";

export function makeGuideEntry(overrides: Partial<GuideEntry> = {}): GuideEntry {
  return {
    id: "earth",
    name: "Earth",
    category: "planet",
    summary: "Mostly harmless.",
    classification: "mostly-harmless",
    tags: ["sol system", "terra"],
    ...overrides,
  };
}

export function makeTravelTask(overrides: Partial<TravelTask> = {}): TravelTask {
  return {
    id: "task-1",
    userId: "user-1",
    title: "Pack a towel",
    status: "open",
    priority: "medium",
    createdAt: new Date("2026-01-01T10:00:00"),
    updatedAt: new Date("2026-01-01T10:00:00"),
    ...overrides,
  };
}

export function makeChatMessage(
  overrides: Partial<ChatMessage> = {},
): ChatMessage {
  return {
    id: "msg-1",
    userId: "user-2",
    displayName: "Ford Prefect",
    text: "Don't panic",
    createdAt: new Date("2026-01-01T10:00:00"),
    ...overrides,
  };
}

export function makeAppUser(overrides: Partial<AppUser> = {}): AppUser {
  return {
    uid: "user-1",
    email: "arthur@dent.dev",
    displayName: "Arthur Dent",
    role: "traveler",
    ...overrides,
  };
}
