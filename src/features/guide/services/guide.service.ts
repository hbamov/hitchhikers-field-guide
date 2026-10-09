import { collection, getDocs } from "firebase/firestore";

import { db } from "../../../shared/firebase/firebase";
import type { GuideEntry } from "../types/guide.types";

export async function getGuideEntries(): Promise<GuideEntry[]> {
  if (!db) {
    throw new Error("Firebase Firestore is not initialized.");
  }

  const snapshot = await getDocs(collection(db, "guideEntries"));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as GuideEntry[];
}
