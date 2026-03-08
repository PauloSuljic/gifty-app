import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../shared/lib/apiClient";

type ExistingUserProfile = {
  username: string;
  bio: string;
  avatarUrl: string;
  dateOfBirth?: string;
};

const BirthdayOnboarding = () => {
  const { firebaseUser, refreshDatabaseUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<ExistingUserProfile | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => new Date(), []);
  const maxDate = useMemo(
    () =>
      new Date(today.getFullYear() - 12, today.getMonth(), today.getDate())
        .toISOString()
        .split("T")[0],
    [today]
  );
  const minDate = useMemo(
    () =>
      new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
        .toISOString()
        .split("T")[0],
    [today]
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!firebaseUser) return;

      try {
        const token = await firebaseUser.getIdToken();
        const profile = await apiClient.get<ExistingUserProfile>(`/api/users/${firebaseUser.uid}`, { token });
        setUserProfile(profile);

        if (profile.dateOfBirth) {
          navigate("/dashboard", { replace: true });
        }
      } catch {
        setError("Failed to load onboarding data. Please refresh and try again.");
      } finally {
        setLoadingProfile(false);
      }
    };

    void fetchUserProfile();
  }, [firebaseUser, navigate]);

  const validateDob = (value: string) => {
    if (!value) {
      return "Please select your date of birth.";
    }

    const dob = new Date(value);
    if (dob > new Date(maxDate)) {
      return "You're too young for Gifty! 🎂 Come back in a few years.";
    }

    if (dob < new Date(minDate)) {
      return "Please enter a valid date of birth.";
    }

    return "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!firebaseUser || !userProfile) {
      setError("Your session is not ready yet. Please refresh and try again.");
      return;
    }

    const validationError = validateDob(dateOfBirth);
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
        body: {
          username: userProfile.username,
          bio: userProfile.bio,
          avatarUrl: userProfile.avatarUrl,
          dateOfBirth,
        },
      });

      await refreshDatabaseUser();
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Failed to save your birthday. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
        <p>Loading onboarding...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-md p-6 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">One last step</h1>
        <p className="text-sm text-gray-300 text-center">
          We use your birthday to power reminders and help friends plan gifts at the right time.
        </p>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="birthday" className="block text-sm text-gray-300 mb-1">
              Your birthday
            </label>
            <input
              id="birthday"
              type="date"
              value={dateOfBirth}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500 appearance-none [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-80 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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

export default BirthdayOnboarding;
