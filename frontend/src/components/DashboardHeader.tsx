import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { GiftyUser } from "../components/PrivateRoute";
import { apiClient } from "../shared/lib/apiClient";
import UserHeader from "./UserHeader";

const DashboardHeader = () => {
  const { firebaseUser } = useAuth();
  const [, setUser] = useState<GiftyUser | null>(null);
  const { databaseUser } = useAuth();

  useEffect(() => {
    if (firebaseUser) {
      const fetchUserData = async () => {
        const token = await firebaseUser.getIdToken();
        const userData = await apiClient.get<GiftyUser>(`/api/users/${firebaseUser.uid}`, {
          token,
        });
        setUser(userData);
      };

      fetchUserData();
    }
  }, [firebaseUser]);

  const calculateDaysUntilBirthday = (dateOfBirth: string) => {
    const today = new Date();
    const dob = new Date(dateOfBirth);
    const currentYear = today.getFullYear();

    // Set next birthday to this year
    let nextBirthday = new Date(currentYear, dob.getMonth(), dob.getDate());

    // If birthday this year has already passed, set to next year
    if (nextBirthday < today) {
      nextBirthday = new Date(currentYear + 1, dob.getMonth(), dob.getDate());
    }

    // Calculate difference in milliseconds
    const diffTime = nextBirthday.getTime() - today.getTime();

    // Convert to days and round up
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <UserHeader
      avatarUrl={databaseUser?.avatarUrl}
      username={databaseUser?.username || "Guest"}
      bio={databaseUser?.bio || "No bio available"}
      subtitle={
        databaseUser?.dateOfBirth
          ? `${calculateDaysUntilBirthday(databaseUser.dateOfBirth)} days until birthday`
          : "No date of birth available"
      }
    />
  );
};

export default DashboardHeader;
