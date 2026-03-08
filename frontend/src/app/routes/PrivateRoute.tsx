import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../../components/ui/Spinner";

const isPendingDisplayName = (value?: string) => /^pending_[a-z0-9]{6}$/i.test((value || "").trim());

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading, databaseUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner />;
  }

  if (firebaseUser && !firebaseUser.emailVerified && firebaseUser.providerData[0]?.providerId === "password") {
    return <Navigate to="/verify-email" />;
  }

  if (firebaseUser && firebaseUser.emailVerified && !databaseUser) {
    return <Spinner />;
  }

  const isOnboardingProfileRoute = location.pathname === "/onboarding/profile";
  const isOnboardingBirthdayRoute = location.pathname === "/onboarding/birthday";
  const isOnboardingRoute = isOnboardingProfileRoute || isOnboardingBirthdayRoute;
  const hasDisplayName =
    Boolean(databaseUser?.username?.trim()) && !isPendingDisplayName(databaseUser?.username);
  const hasBirthday = Boolean(databaseUser?.dateOfBirth?.trim());

  if (firebaseUser && databaseUser && !hasDisplayName && !isOnboardingProfileRoute) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  if (firebaseUser && databaseUser && hasDisplayName && !hasBirthday && !isOnboardingBirthdayRoute) {
    return <Navigate to="/onboarding/birthday" replace />;
  }

  if (firebaseUser && databaseUser && hasDisplayName && isOnboardingProfileRoute) {
    return <Navigate to={hasBirthday ? "/dashboard" : "/onboarding/birthday"} replace />;
  }

  if (firebaseUser && databaseUser && hasBirthday && isOnboardingRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return firebaseUser && databaseUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
