import { useCallback, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { apiFetch } from "../api";

export type GiftyUser = {
  id: string;
  email: string;
  username: string;
  bio: string;
  avatarUrl: string;
  dateOfBirth?: string;
};

type CreateDatabaseUserInput = {
  user: FirebaseUser;
  email: string;
  username: string;
  dateOfBirth: string;
};

const getAvatarUrl = (photoUrl?: string | null) => {
  const randomAvatar = `/avatars/avatar${Math.floor(Math.random() * 9) + 1}.png`;
  return photoUrl || randomAvatar;
};

export const useDatabaseUser = (firebaseUser: FirebaseUser | null) => {
  const [databaseUser, setDatabaseUser] = useState<GiftyUser | null>(null);

  const fetchDatabaseUser = useCallback(async (token: string, uid: string) => {
    const res = await apiFetch(`/api/users/${uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setDatabaseUser(data);
    }
  }, []);

  useEffect(() => {
    const syncDatabaseUser = async () => {
      if (!firebaseUser) {
        setDatabaseUser(null);
        return;
      }

      const token = await firebaseUser.getIdToken();
      await fetchDatabaseUser(token, firebaseUser.uid);
    };

    void syncDatabaseUser();
  }, [firebaseUser, fetchDatabaseUser]);

  const refreshDatabaseUser = useCallback(async () => {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken();
      await fetchDatabaseUser(token, firebaseUser.uid);
    }
  }, [firebaseUser, fetchDatabaseUser]);

  const ensureDatabaseUser = useCallback(async (user: FirebaseUser) => {
    const token = await user.getIdToken();
    const response = await apiFetch(`/api/users/${user.uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 404) {
      const avatarUrl = getAvatarUrl(user.photoURL);

      await apiFetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: user.uid,
          username: user.displayName || `user_${user.uid.substring(0, 6)}`,
          email: user.email,
          bio: "",
          avatarUrl,
          dateOfBirth: "2000-01-01",
        }),
      });
    }
  }, []);

  const createDatabaseUser = useCallback(async (input: CreateDatabaseUserInput) => {
    const token = await input.user.getIdToken();
    const avatarUrl = getAvatarUrl(input.user.photoURL);

    await apiFetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: input.user.uid,
        username: input.username,
        email: input.email,
        bio: "",
        avatarUrl,
        dateOfBirth: input.dateOfBirth,
      }),
    });
  }, []);

  const clearDatabaseUser = useCallback(() => {
    setDatabaseUser(null);
  }, []);

  return {
    databaseUser,
    refreshDatabaseUser,
    ensureDatabaseUser,
    createDatabaseUser,
    clearDatabaseUser,
  };
};
