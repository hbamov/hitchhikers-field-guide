import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../shared/firebase/firebase";
import { guideEntrySchema, type GuideEntry } from "../types/guide.types";

export async function getGuideEntries(): Promise<GuideEntry[]> {
  if (!db) throw new Error("Firebase Firestore is not initialized.");

  const snapshot = await getDocs(collection(db, "guideEntries"));
  const entries: GuideEntry[] = [];

  for (const doc of snapshot.docs) {
    const result = guideEntrySchema.safeParse(doc.data());
    if (result.success) {
      entries.push({ id: doc.id, ...result.data });
    } else {
      console.warn(
        `Skipping invalid guide entry "${doc.id}"`,
        result.error.issues,
      );
    }
  }
  return entries;
}
