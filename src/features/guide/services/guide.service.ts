import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../../../shared/firebase/firebase";
import {
  guideEntrySchema,
  type GuideCategory,
  type GuideClassification,
  type GuideEntry,
} from "../types/guide.types";

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

export interface UpsertGuideEntryInput {
  id: string; // doc id
  name: string;
  category: GuideCategory;
  summary: string;
  classification: GuideClassification;
  tags: string[];
}

export async function upsertGuideEntry(
  input: UpsertGuideEntryInput,
): Promise<void> {
  if (!db) throw new Error("Firebase Firestore is not initialized.");

  const payload = {
    name: input.name.trim(),
    category: input.category,
    summary: input.summary.trim(),
    classification: input.classification,
    tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
  };

  const parsed = guideEntrySchema.safeParse(payload);
  if (!parsed.success) throw new Error("Invalid guide entry data.");

  await setDoc(doc(db, "guideEntries", input.id), parsed.data, { merge: true });
}

export async function removeGuideEntry(entryId: string): Promise<void> {
  if (!db) throw new Error("Firebase Firestore is not initialized.");
  await deleteDoc(doc(db, "guideEntries", entryId));
}
