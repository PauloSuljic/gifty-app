import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { apiClient } from "../shared/lib/apiClient";

const avatarOptions = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  "/avatars/avatar5.png",
  "/avatars/avatar6.png",
  "/avatars/avatar7.png",
  "/avatars/avatar8.png",
  "/avatars/avatar9.png"
];

type ProfileFormState = {
  username: string;
  bio: string;
  avatarUrl: string;
  dateOfBirth: string;
};

const Profile = () => {
  const { firebaseUser, refreshDatabaseUser } = useAuth();
  const [user, setUser] = useState<ProfileFormState>({
    username: "",
    bio: "",
    avatarUrl: "",
    dateOfBirth: "",
  });
  const [initialUser, setInitialUser] = useState<ProfileFormState>({
    username: "",
    bio: "",
    avatarUrl: "",
    dateOfBirth: "",
  });
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [initialSelectedAvatar, setInitialSelectedAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isDirty =
    user.username !== initialUser.username ||
    user.bio !== initialUser.bio ||
    user.dateOfBirth !== initialUser.dateOfBirth ||
    selectedAvatar !== initialSelectedAvatar;

  useEffect(() => {
    if (!firebaseUser) return;

    const fetchUserData = async () => {
      const token = await firebaseUser.getIdToken();
      const userData = await apiClient.get<{
        username: string;
        bio: string;
        avatarUrl: string;
        dateOfBirth?: string;
      }>(`/api/users/${firebaseUser.uid}`, { token });
      const initialState = {
        username: userData.username,
        bio: userData.bio,
        avatarUrl: userData.avatarUrl,
        dateOfBirth: userData.dateOfBirth || ""
      };

      setUser(initialState);
      setInitialUser(initialState);
      setSelectedAvatar(userData.avatarUrl);
      setInitialSelectedAvatar(userData.avatarUrl);
    };

    fetchUserData();
  }, [firebaseUser]);

  const handleUpdateProfile = async () => {
    if (!firebaseUser || !isDirty || isSaving) return;
    const token = await firebaseUser?.getIdToken();
    setIsSaving(true);

    try {
      await apiClient.request<void>(`/api/users/${firebaseUser?.uid}`, {
        method: "PUT",
        token,
        body: {
          username: user.username,
          bio: user.bio,
          avatarUrl: selectedAvatar,
          dateOfBirth: user.dateOfBirth,
        },
      });
    } catch {
      setIsSaving(false);
      toast.error("Failed to update profile 😞");
      return;
    }

    setInitialUser(user);
    setInitialSelectedAvatar(selectedAvatar);
    setIsSaving(false);
    toast.success("Profile updated successfully! 🎉");

    await refreshDatabaseUser(); // ✅ This updates the header instantly
  };

  return (
    <>
      <h2 className="text-xl sm:text-3xl font-semibold pt-6 text-center">Edit Profile</h2>
      <div className="mx-auto p-4 text-white w-full max-w-4xl">
        <div className="flex flex-col md:flex-row justify-center gap-5">
          {/* Left: Username & Bio */}
          <div className="w-full md:w-1/2">
            <div className="mb-4">
              <label className="block text-gray-400">Username</label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white outline-none"
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                maxLength={25}
              />
            </div>
  
            <div className="mb-4">
              <label className="block text-gray-400">Bio</label>
              <textarea
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white outline-none resize-none"
                value={user.bio}
                onChange={(e) => setUser({ ...user, bio: e.target.value })}
                maxLength={70}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400">Date of Birth</label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white outline-none appearance-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                value={user.dateOfBirth}
                onChange={(e) => setUser({ ...user, dateOfBirth: e.target.value })}
              />
            </div>
          </div>
  
          {/* Right: Avatars */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <label className="block text-gray-400 mb-3">Select Avatar</label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
              {avatarOptions.map((avatar) => (
                <img
                  key={avatar}
                  src={avatar}
                  alt="Avatar"
                  className={`w-16 h-16 rounded-full cursor-pointer border-4 transition ${
                    selectedAvatar === avatar ? "border-blue-500 scale-105" : "border-transparent"
                  }`}
                  onClick={() => setSelectedAvatar(avatar)}
                />
              ))}
            </div>
          </div>
        </div>
  
        {/* Save Button */}
        {isDirty && (
          <p className="text-sm text-amber-300 mt-6 mb-2">Unsaved changes</p>
        )}
        <button
          onClick={handleUpdateProfile}
          disabled={!isDirty || isSaving}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/60 disabled:cursor-not-allowed rounded-lg transition shadow-lg w-full mt-1"
        >
          Save Changes
        </button>
      </div>
    </>
  );  
  
};

export default Profile;
