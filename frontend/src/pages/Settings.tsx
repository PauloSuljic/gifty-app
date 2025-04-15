import Layout from "../components/layout/Layout";
import ConfirmDeleteModal from "../components/ui/modals/ConfirmDeleteModal";
import { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { apiFetch } from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const SettingsPage = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { firebaseUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (!firebaseUser) return;

    setIsDeleting(true);
    try {
      const token = await firebaseUser.getIdToken();

      const response = await apiFetch(`/api/users/${firebaseUser.uid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to delete account.");
        return;
      }

      toast.success("Account deleted.");
      await logout(); // Log out user and clear state
      navigate("/");  // Redirect to homepage
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-3xl font-semibold pt-6 text-center">Settings</h2>
      <div className="mx-auto p-4 text-white w-full max-w-4xl">
        <section className="bg-white/10 rounded-xl p-6 mt-6 shadow-lg">
          <h3 className="text-2xl font-bold text-purple-400 mb-2">Legal</h3>
          <p className="text-gray-300 mb-4">
            Learn more about how we handle your data and what you agree to by using Gifty.
          </p>

          <div className="space-y-2">
            <a
              href="/terms"
              className="block text-blue-400 hover:underline hover:text-blue-300 transition"
              target="_blank" 
              rel="noopener noreferrer"
            >
              📄 Terms of Service
            </a>
            <a
              href="/privacy"
              className="block text-blue-400 hover:underline hover:text-blue-300 transition"
              target="_blank" 
              rel="noopener noreferrer"
            >
              🔐 Privacy Policy
            </a>
          </div>
        </section>
        <section className="bg-white/10 rounded-xl p-6 mt-6 shadow-lg">
          <h3 className="text-2xl font-bold text-red-400 mb-2">Danger Zone</h3>
          <p className="text-gray-300 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition disabled:opacity-50"
            disabled={isDeleting}
          >
            Delete Account
          </button>
        </section>
      </div>

      {/* 🔥 Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        itemName="your account"
      />
    </Layout>
  );
};

export default SettingsPage;
