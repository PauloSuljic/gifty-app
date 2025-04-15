import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import Layout from "../components/layout/Layout";
import { toast } from "react-hot-toast";
import { apiFetch } from "../api";

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

const Profile = () => {
  const { firebaseUser, refreshDatabaseUser } = useAuth();
  const [user, setUser] = useState({ username: "", bio: "", avatarUrl: "" });
  const [selectedAvatar, setSelectedAvatar] = useState("");

  useEffect(() => {
    if (!firebaseUser) return;

    const fetchUserData = async () => {
      const token = await firebaseUser.getIdToken();
      const response = await apiFetch(`/api/users/${firebaseUser.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData = await response.json();
      setUser(userData);
      setSelectedAvatar(userData.avatarUrl);
    };

    fetchUserData();
  }, [firebaseUser]);

  const handleUpdateProfile = async () => {
    const token = await firebaseUser?.getIdToken();

    const response = await apiFetch(`/api/users/${firebaseUser?.uid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        username: user.username,
        bio: user.bio,
        avatarUrl: selectedAvatar
      })
    });

    if (!response.ok) {
      toast.error("Failed to update profile 😞");
      return;
    }

    toast.success("Profile updated successfully! 🎉");

    await refreshDatabaseUser(); // ✅ This updates the header instantly
  };

  return (
    <Layout>
      <h2 className="text-2xl sm:text-3xl font-semibold pt-6 text-center">Edit Profile</h2>
      <div className="mx-auto p-4 text-white w-full max-w-4xl">
        <div className="flex flex-col md:flex-row justify-center gap-10">
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
        <button
          onClick={handleUpdateProfile}
          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg transition shadow-lg w-full mt-6"
        >
          Save Changes
        </button>
      </div>
    </Layout>
  );  
  
};

export default Profile;
