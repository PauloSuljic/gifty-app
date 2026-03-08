import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { ApiError, apiClient } from "../../shared/lib/apiClient";
import Spinner from "../../components/ui/Spinner";

// Define our database user type
export type GiftyUser = {
  id: string;
  username: string;
  bio: string;
  email: string;
  avatarUrl: string;
  dateOfBirth?: string;
};

const isPendingDisplayName = (value?: string) => /^pending_[a-z0-9]{6}$/i.test((value || "").trim());

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading } = useAuth();
  const location = useLocation();
  const [user, setUser] = useState<GiftyUser | null>(null);
  const [fetching, setFetching] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!firebaseUser) {
        setFetching(false);
        return;
      }

      if (!firebaseUser.emailVerified) {
        setFetching(false);
        return;
      }

      if (hasFetched.current) return;
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
                username: `pending_${firebaseUser.uid.substring(0, 6)}`,
                email: firebaseUser.email,
                avatarUrl: "",
                bio: "",
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

  const isOnboardingProfileRoute = location.pathname === "/onboarding/profile";
  const isOnboardingBirthdayRoute = location.pathname === "/onboarding/birthday";
  const isOnboardingRoute = isOnboardingProfileRoute || isOnboardingBirthdayRoute;
  const hasDisplayName = Boolean(user?.username?.trim()) && !isPendingDisplayName(user?.username);
  const hasBirthday = Boolean(user?.dateOfBirth?.trim());

  if (firebaseUser && user && !hasDisplayName && !isOnboardingProfileRoute) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  if (firebaseUser && user && hasDisplayName && !hasBirthday && !isOnboardingBirthdayRoute) {
    return <Navigate to="/onboarding/birthday" replace />;
  }

  if (firebaseUser && user && hasDisplayName && isOnboardingProfileRoute) {
    return <Navigate to={hasBirthday ? "/dashboard" : "/onboarding/birthday"} replace />;
  }

  if (firebaseUser && user && hasBirthday && isOnboardingRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Allow route only if both auth and user data exist
  return firebaseUser && user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
