import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../../../shared/firebase/firebase";
import type { TravelTask, TravelTaskDoc } from "../types/travelTask.types";

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
  if (!db) {
    throw new Error("Firebase Firestore is not initialized.");
  }

  const tasksQuery = query(
    collection(db, "travelTasks"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(tasksQuery);

  return snapshot.docs.map((doc) =>
    mapTaskDoc(doc.id, doc.data() as TravelTaskDoc),
  );
}
