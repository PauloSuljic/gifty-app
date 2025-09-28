import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { GiftyUser } from "../components/PrivateRoute";
import { apiFetch } from "../api";
import UserHeader from "./UserHeader";

const DashboardHeader = () => {
  const { firebaseUser } = useAuth();
  const [, setUser] = useState<GiftyUser | null>(null);
  const { databaseUser } = useAuth();

  useEffect(() => {
    if (firebaseUser) {
      const fetchUserData = async () => {
        const token = await firebaseUser.getIdToken();
        const response = await apiFetch(`/api/users/${firebaseUser.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");
        const userData = await response.json();
        setUser(userData);
      };

      fetchUserData();
    }
  }, [firebaseUser]);

  return (
    <UserHeader
      avatarUrl={databaseUser?.avatarUrl}
      username={databaseUser?.username || "Guest"}
      bio={databaseUser?.bio || "No bio available"}
    />
  );
};

export default DashboardHeader;
