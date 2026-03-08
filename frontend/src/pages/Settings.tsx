import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../shared/lib/apiClient";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import Modal from "../components/ui/Modal";

const SettingsPage = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { firebaseUser, databaseUser, logout } = useAuth();

  const handleDeleteAccount = async () => {
    if (!firebaseUser || isDeleting) return;

    setIsDeleting(true);
    try {
      const token = await firebaseUser.getIdToken();
      await apiClient.del<void>(`/api/users/${firebaseUser.uid}`, { token });
      toast.success("Account deleted. Redirecting to home...");
      await logout();
    } catch {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl sm:text-3xl font-semibold pt-6 text-center">Settings</h2>
      <div className="mx-auto p-4 pb-8 text-white w-full max-w-4xl space-y-5">
        <section className="bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-2">Account</h3>
          <p className="text-sm text-gray-300 mb-4 leading-relaxed">
            Review your account details and keep your profile up to date.
          </p>
          <div className="space-y-3 text-sm">
            <p className="text-gray-300">
              <span className="text-gray-400">Email:</span>{" "}
              <span className="text-white/95 break-all">{databaseUser?.email ?? firebaseUser?.email ?? "Not available"}</span>
            </p>
            <p className="text-gray-300">
              <span className="text-gray-400">Username:</span>{" "}
              <span className="text-white/95">{databaseUser?.username ?? "Not set"}</span>
            </p>
            <Link
              to="/profile"
              className="inline-flex mt-1 text-purple-300 hover:text-purple-200 transition underline underline-offset-4"
            >
              Edit profile
            </Link>
          </div>
        </section>

        <section className="bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-2">Legal</h3>
          <p className="text-sm text-gray-300 mb-4 leading-relaxed">
            Read the policies that apply when using Gifty.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <Link
              to="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-700 bg-gray-700/50 px-4 py-3 hover:bg-gray-700 transition"
            >
              <p className="font-medium text-white">Terms of Service</p>
              <p className="text-gray-300 mt-1">What you agree to when using Gifty.</p>
            </Link>
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-700 bg-gray-700/50 px-4 py-3 hover:bg-gray-700 transition"
            >
              <p className="font-medium text-white">Privacy Policy</p>
              <p className="text-gray-300 mt-1">How your data is collected, used, and deleted.</p>
            </Link>
          </div>
        </section>

        <section className="bg-gray-800 border border-red-400/35 rounded-xl p-5 sm:p-6 shadow-lg">
          <h3 className="text-lg font-bold text-red-300 mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-200 mb-4 leading-relaxed">
            Deleting your account permanently removes your profile, wishlist data, and shared access. This cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-11 min-w-[10rem]"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete account"}
          </button>
        </section>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
          }
        }}
      >
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Delete account?</h3>
          <p className="text-sm text-gray-300">
            This permanently deletes your account and all associated data. Your wishlists, shares, and profile cannot be recovered.
          </p>
          <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
            <li>All wishlist and profile data will be removed.</li>
            <li>Shared wishlist access will end immediately.</li>
            <li>This action is irreversible.</li>
          </ul>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-11"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-11"
            >
              {isDeleting ? "Deleting account..." : "Yes, delete my account"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SettingsPage;
