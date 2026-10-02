import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../../shared/firebase/firebase";
import type { AppUser } from "../../../shared/types/user";

function requireFirebase() {
  if (!auth || !db)
    throw new Error(
      "Firebase is not configured. Add your Firebase values to .env.local.",
    );
  return { auth, db };
}

export async function signIn(email: string, password: string) {
  const { auth } = requireFirebase();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerAccount(
  displayName: string,
  email: string,
  password: string,
) {
  const { auth, db } = requireFirebase();
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  await updateProfile(credential.user, { displayName });
  await setDoc(doc(db, "users", credential.user.uid), {
    email,
    displayName,
    role: "traveler",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return credential;
}

export async function resetPassword(email: string) {
  const { auth } = requireFirebase();
  return sendPasswordResetEmail(auth, email);
}

export async function signOut() {
  const { auth } = requireFirebase();
  return firebaseSignOut(auth);
}

export async function getAppUser(user: User): Promise<AppUser> {
  const { db } = requireFirebase();
  const snapshot = await getDoc(doc(db, "users", user.uid));
  if (!snapshot.exists()) {
    throw new Error(
      "Your account profile is missing. Contact an administrator.",
    );
  }
  const data = snapshot.data();
  return {
    uid: user.uid,
    email: user.email ?? "",
    displayName: data.displayName ?? user.displayName ?? "Traveler",
    role: data.role ?? "traveler",
  };
}
