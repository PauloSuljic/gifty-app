import { createContext, useContext } from "react";
import {
  GoogleAuthProvider,
  signOut,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "./ui/Spinner";
import { useDatabaseUser, GiftyUser } from "../hooks/useDatabaseUser";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

// ✅ Define context type
interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username: string, dateOfBirth: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshFirebaseUser: () => Promise<void>;
  databaseUser: GiftyUser | null;
  refreshDatabaseUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading, refreshFirebaseUser, clearFirebaseUser } = useFirebaseAuth();
  const {
    databaseUser,
    refreshDatabaseUser,
    ensureDatabaseUser,
    createDatabaseUser,
    clearDatabaseUser,
  } = useDatabaseUser(firebaseUser);
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      auth.useDeviceLanguage();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await ensureDatabaseUser(user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error", error);
    }
  };

  const register = async (email: string, password: string, username: string, dateOfBirth: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });
      await sendEmailVerification(user);

      await createDatabaseUser({
        user,
        email,
        username,
        dateOfBirth,
      });

      navigate("/verify-email");
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error("Failed to register. Please try again.", {
        duration: 3000,
        position: "bottom-center",
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
    clearFirebaseUser();
    clearDatabaseUser();
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
