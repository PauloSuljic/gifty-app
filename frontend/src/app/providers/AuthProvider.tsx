import {
  GoogleAuthProvider,
  signOut,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";
import { useDatabaseUser } from "../../hooks/useDatabaseUser";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";
import { AuthContext } from "../../context/AuthContext";
import { createPendingDisplayName } from "../../shared/lib/pendingDisplayName";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading, refreshFirebaseUser, clearFirebaseUser } = useFirebaseAuth();
  const {
    databaseUser,
    databaseUserLoading,
    databaseUserError,
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
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await createDatabaseUser({
        user,
        email,
        username: createPendingDisplayName(user.uid),
      });

      navigate("/verify-email");
    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
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
        databaseUserLoading,
        databaseUserError,
        refreshDatabaseUser,
      }}
    >
      {loading ? <Spinner /> : children}
    </AuthContext.Provider>
  );
};
