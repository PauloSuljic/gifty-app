import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import toast from "react-hot-toast";
import Spinner from "./ui/Spinner";

// ✅ Define PostgreSQL User
export type GiftyUser = {
  id: string;
  email: string;
  username: string;
  bio: string;
  avatarUrl: string;
};

// ✅ Define context type
interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshFirebaseUser: () => Promise<void>;
  databaseUser: GiftyUser | null;
  refreshDatabaseUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [databaseUser, setDatabaseUser] = useState<GiftyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔄 Refetch user from backend (PostgreSQL)
  const fetchDatabaseUser = async (token: string, uid: string) => {
    const res = await apiFetch(`/api/users/${uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setDatabaseUser(data);
    }
  };

  // ✅ Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setLoading(false);

      if (user) {
        const token = await user.getIdToken();
        await fetchDatabaseUser(token, user.uid);
      } else {
        setDatabaseUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshDatabaseUser = async () => {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken();
      await fetchDatabaseUser(token, firebaseUser.uid);
    }
  };

  const refreshFirebaseUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setFirebaseUser(auth.currentUser);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      auth.useDeviceLanguage();
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error", error);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });
      await sendEmailVerification(user);

      navigate("/verify-email");
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error("Failed to register. Please try again.", {
        duration: 3000,
        position: "bottom-center"
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setDatabaseUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        loading,
        loginWithGoogle,
        register,
        logout,
        refreshFirebaseUser,
        databaseUser,
        refreshDatabaseUser,
      }}
    >
      {loading ? <Spinner /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
