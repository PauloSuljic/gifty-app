import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export const useFirebaseAuth = () => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshFirebaseUser = useCallback(async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setFirebaseUser(auth.currentUser);
    }
  }, []);

  const clearFirebaseUser = useCallback(() => {
    setFirebaseUser(null);
  }, []);

  return {
    firebaseUser,
    loading,
    refreshFirebaseUser,
    clearFirebaseUser,
  };
};
