import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../shared/lib/apiClient";
import { isPendingDisplayName } from "../shared/lib/pendingDisplayName";

const ProfileNameOnboarding = () => {
  const { firebaseUser, databaseUser, refreshDatabaseUser } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedName = useMemo(() => {
    if (firebaseUser?.displayName?.trim()) {
      return firebaseUser.displayName.trim();
    }

    if (databaseUser?.username?.trim() && !isPendingDisplayName(databaseUser.username)) {
      return databaseUser.username.trim();
    }

    return "";
  }, [databaseUser?.username, firebaseUser?.displayName]);

  useEffect(() => {
    setDisplayName(suggestedName);
  }, [suggestedName]);

  const validateDisplayName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Please enter your name.";
    }

    if (trimmed.length < 2) {
      return "Name must be at least 2 characters.";
    }

    if (trimmed.length > 60) {
      return "Name cannot exceed 60 characters.";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!firebaseUser || !databaseUser) {
      setError("Your session is not ready yet. Please refresh and try again.");
      return;
    }

    const validationError = validateDisplayName(displayName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await firebaseUser.getIdToken();

      await apiClient.request<void>(`/api/users/${firebaseUser.uid}`, {
        method: "PUT",
        token,
        body: { username: displayName.trim() },
      });

      await refreshDatabaseUser();
      navigate("/onboarding/birthday", { replace: true });
    } catch {
      setError("Failed to save your name. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!databaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
        <p>Loading onboarding...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-md p-6 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Welcome to Gifty</h1>
        <p className="text-sm text-gray-300 text-center">
          How should your name appear to friends?
        </p>
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm text-gray-300 mb-1">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500"
              autoComplete="name"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-2 rounded transition ${
              isSubmitting ? "bg-gray-600 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileNameOnboarding;
