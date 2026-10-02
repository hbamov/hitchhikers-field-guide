import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../../../shared/firebase/firebase";
import type { AppUser } from "../../../shared/types/user";
import {
  getAppUser,
  registerAccount,
  resetPassword,
  signIn,
  signOut,
} from "../services/authService";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  firebaseConfigured: boolean;
  signInWithEmail: typeof signIn;
  register: typeof registerAccount;
  sendPasswordReset: typeof resetPassword;
  signOutUser: typeof signOut;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function friendlyAuthError(error: unknown) {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/user-not-found": "No account was found with that email address.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Choose a password with at least 6 characters.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "permission-denied":
      "Your profile could not be read. Check the Firestore rules.",
  };
  return (
    messages[code ?? ""] ??
    (error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.")
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      setLoading(true);
      setError(null);
      try {
        setUser(firebaseUser ? await getAppUser(firebaseUser) : null);
      } catch (authError) {
        setUser(null);
        setError(friendlyAuthError(authError));
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      firebaseConfigured: isFirebaseConfigured,
      signInWithEmail: async (...args) => {
        try {
          setError(null);
          return await signIn(...args);
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }
      },
      register: async (...args) => {
        try {
          setError(null);
          return await registerAccount(...args);
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }
      },
      sendPasswordReset: async (...args) => {
        try {
          setError(null);
          return await resetPassword(...args);
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }
      },
      signOutUser: async () => {
        try {
          setError(null);
          return await signOut();
        } catch (e) {
          throw new Error(friendlyAuthError(e));
        }
      },
    }),
    [user, loading, error],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuth must be used inside AuthProvider");

  return context;
}
