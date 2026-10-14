import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../../../shared/firebase/firebase";
import type {
  CreateTravelTaskInput,
  TravelTask,
  TravelTaskDoc,
  UpdateTravelTaskInput,
} from "../types/travelTask.types";
import type { GuideEntry } from "../../guide/types/guide.types";

function toDate(value?: Timestamp): Date | undefined {
  return value?.toDate();
}

function mapTaskDoc(id: string, data: TravelTaskDoc): TravelTask {
  return {
    id,
    userId: data.userId,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: toDate(data.dueDate),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    completedAt: toDate(data.completedAt),
  };
}

export async function getTravelTasks(userId: string): Promise<TravelTask[]> {
  if (!db) throw new Error("Firebase Firestore is not initialized.");

  const tasksQuery = query(
    collection(db, "travelTasks"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(tasksQuery);

  return snapshot.docs.map((taskDoc) =>
    mapTaskDoc(taskDoc.id, taskDoc.data() as TravelTaskDoc),
  );
}

export async function createTravelTask(
  userId: string,
  input: CreateTravelTaskInput,
): Promise<void> {
  if (!db) throw new Error("Firebase Firestore is not initialized.");

  await addDoc(collection(db, "travelTasks"), {
    userId,
    title: input.title.trim(),
    description: input.description?.trim() || "",
    status: "open",
    priority: input.priority,
    dueDate: input.dueDate ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
  });
}

export async function updateTravelTask(
  taskId: string,
  input: UpdateTravelTaskInput,
): Promise<void> {
  if (!db) throw new Error("Firebase Firestore is not initialized.");

  const updatePayload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (input.title !== undefined) updatePayload.title = input.title.trim();
  if (input.description !== undefined)
    updatePayload.description = input.description.trim();
  if (input.priority !== undefined) updatePayload.priority = input.priority;
  if (input.status !== undefined) updatePayload.status = input.status;
  if (input.dueDate !== undefined)
    updatePayload.dueDate = input.dueDate ?? null;
  if (input.completedAt !== undefined)
    updatePayload.completedAt = input.completedAt ?? null;

  await updateDoc(doc(db, "travelTasks", taskId), updatePayload);
}

export async function deleteTravelTask(taskId: string): Promise<void> {
  if (!db) throw new Error("Firebase Firestore is not initialized.");
  await deleteDoc(doc(db, "travelTasks", taskId));
}

/**
 * Creates a checklist task based on a Guide entry.
 */
export async function createTravelTaskFromGuideEntry(
  userId: string,
  entry: GuideEntry,
): Promise<void> {
  const description = `Guide category: ${entry.category}. ${entry.summary}`;
  const truncatedDescription =
    description.length > 500 ? `${description.slice(0, 497)}...` : description;

  await createTravelTask(userId, {
    title: `Research ${entry.name}`,
    description: truncatedDescription,
    priority: "medium",
  });
}
