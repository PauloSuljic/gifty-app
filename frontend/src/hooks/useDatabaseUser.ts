import { useCallback, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { ApiError, apiClient } from "../shared/lib/apiClient";

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
    try {
      const data = await apiClient.get<GiftyUser>(`/api/users/${uid}`, { token });
      setDatabaseUser(data);
    } catch (error) {
      console.error("Failed to fetch database user:", error);
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
    try {
      await apiClient.get<GiftyUser>(`/api/users/${user.uid}`, { token });
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) {
        throw error;
      }

      const avatarUrl = getAvatarUrl(user.photoURL);

      await apiClient.post<void>(
        "/api/users",
        {
          id: user.uid,
          username: user.displayName || `user_${user.uid.substring(0, 6)}`,
          email: user.email,
          bio: "",
          avatarUrl,
          dateOfBirth: "2000-01-01",
        },
        { token }
      );
    }
  }, []);

  const createDatabaseUser = useCallback(async (input: CreateDatabaseUserInput) => {
    const token = await input.user.getIdToken();
    const avatarUrl = getAvatarUrl(input.user.photoURL);

    await apiClient.post<void>(
      "/api/users",
      {
        id: input.user.uid,
        username: input.username,
        email: input.email,
        bio: "",
        avatarUrl,
        dateOfBirth: input.dateOfBirth,
      },
      { token }
    );
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
