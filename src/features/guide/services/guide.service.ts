import {
  collection,
  doc,
  getDoc,
  getDocs,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../../shared/firebase/firebase";
import { guideEntrySchema, type GuideEntry } from "../types/guide.types";

function parseGuideEntry(id: string, data: DocumentData): GuideEntry | null {
  const parsed = guideEntrySchema.safeParse(data);

  if (!parsed.success) {
    console.warn(`Skipping invalid guide entry "${id}"`, parsed.error.issues);
    return null;
  }

  return { id, ...parsed.data };
}

export async function getGuideEntries(): Promise<GuideEntry[]> {
  if (!db) throw new Error("Firebase Firestore is not initialized.");

  const snapshot = await getDocs(collection(db, "guideEntries"));
  const entries: GuideEntry[] = [];

  for (const entryDoc of snapshot.docs) {
    const entry = parseGuideEntry(entryDoc.id, entryDoc.data());
    if (entry) entries.push(entry);
  }

  return entries;
}

export async function getGuideEntryById(
  entryId: string,
): Promise<GuideEntry | null> {
  if (!db) throw new Error("Firebase Firestore is not initialized.");

  const snapshot = await getDoc(doc(db, "guideEntries", entryId));
  if (!snapshot.exists()) return null;

  return parseGuideEntry(snapshot.id, snapshot.data());
}
