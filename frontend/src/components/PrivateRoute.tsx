import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { ApiError, apiClient } from "../shared/lib/apiClient";
import Spinner from "./ui/Spinner";

// Define our database user type
export type GiftyUser = {
  id: string;
  username: string;
  bio: string;
  email: string;
  avatarUrl: string;
  dateOfBirth?: string;
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading } = useAuth();
  const [user, setUser] = useState<GiftyUser | null>(null);
  const [fetching, setFetching] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!firebaseUser || !firebaseUser.emailVerified || hasFetched.current) return;
      hasFetched.current = true;
      setFetching(true);

      try {
        const token = await firebaseUser.getIdToken();

        let userData: GiftyUser;

        try {
          userData = await apiClient.get<GiftyUser>(`/api/users/${firebaseUser.uid}`, { token });
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) {
            console.log("User not found, creating...");
            await apiClient.post<void>(
              "/api/users",
              {
                id: firebaseUser.uid,
                username: firebaseUser.displayName || "New User",
                email: firebaseUser.email,
                avatarUrl: "",
                bio: "",
                dateOfBirth: ""
              },
              { token }
            );

            userData = await apiClient.get<GiftyUser>(`/api/users/${firebaseUser.uid}`, { token });
          } else {
            throw error;
          }
        }

        setUser({
          id: userData.id,
          username: userData.username || firebaseUser.displayName || "Unknown",
          bio: userData.bio || "",
          email: userData.email,
          avatarUrl: userData.avatarUrl || "",
          dateOfBirth: userData.dateOfBirth || ""
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [firebaseUser]);

  // ✅ Block loading
  if (loading || fetching) {
    return <Spinner />
  } 

  // ✅ Redirect unverified users
  if (firebaseUser && !firebaseUser.emailVerified && firebaseUser.providerData[0]?.providerId === "password") {
    return <Navigate to="/verify-email" />;
  }

  // ✅ Allow route only if both auth and user data exist
  return firebaseUser && user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
