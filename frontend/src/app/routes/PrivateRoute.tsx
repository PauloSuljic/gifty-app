import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../../components/ui/Spinner";
import { isPendingDisplayName } from "../../shared/lib/pendingDisplayName";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading, databaseUser, databaseUserLoading, databaseUserError, refreshDatabaseUser } =
    useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner />;
  }

  if (
    firebaseUser &&
    !firebaseUser.emailVerified &&
    firebaseUser.providerData.some((provider) => provider?.providerId === "password")
  ) {
    return <Navigate to="/verify-email" />;
  }

  if (firebaseUser && firebaseUser.emailVerified && databaseUserLoading) {
    return <Spinner />;
  }

  if (firebaseUser && firebaseUser.emailVerified && !databaseUser) {
    if (databaseUserError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
          <div className="w-full max-w-md p-6 space-y-4 bg-gray-800 rounded-lg shadow-lg text-center">
            <p className="text-red-400 text-sm">{databaseUserError}</p>
            <button
              type="button"
              onClick={() => void refreshDatabaseUser()}
              className="w-full px-4 py-2 rounded transition bg-purple-600 hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

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
