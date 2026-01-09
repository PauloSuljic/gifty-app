import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import Modal from "../Modal";
import { apiClient } from "../../../shared/lib/apiClient";
import { useAuth } from "../../../hooks/useAuth";
import type { WishlistType } from "../../../hooks/useWishlists";

interface RenameWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: WishlistType | null;
  onWishlistRenamed: (updated: WishlistType) => void;
}

const RenameWishlistModal = ({ isOpen, onClose, wishlist, onWishlistRenamed }: RenameWishlistModalProps) => {
  const { firebaseUser } = useAuth();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wishlist) {
      setNewName(wishlist.name);
    }
  }, [wishlist]);

  const handleSubmit = async () => {
    if (!wishlist) return;
    if (!newName.trim()) {
      setError("Name is required.");
      return;
    }
    if (newName.length > 30) {
      setError("Name must be under 30 characters.");
      return;
    }

    const token = await firebaseUser?.getIdToken();
    if (!token) return;

    try {
      const updatedWishlist = await apiClient.patch<{ id: string; name: string }>(
        `/api/wishlists/${wishlist.id}`,
        { name: newName },
        { token }
      );
      onWishlistRenamed({ ...wishlist, ...updatedWishlist });
      toast.success("Wishlist renamed! ✏️", {
        duration: 3000,
        position: "bottom-center",
        style: {
          background: "#333",
          color: "#fff",
          border: "1px solid #555",
        },
      });
      onClose();
      setNewName("");
      setError(null);
    } catch {
      setError("Failed to rename wishlist.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Rename Wishlist</h2>
      <input
        type="text"
        placeholder="New wishlist name"
        value={newName}
        onChange={(e) => {
          setNewName(e.target.value);
          setError(null);
        }}
        maxLength={30}
        className={`w-full px-4 py-2 rounded bg-gray-700 text-white mb-2 border ${
          error ? "border-red-500" : "border-transparent"
        }`}
      />
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <button onClick={handleSubmit} className="px-4 py-2 bg-purple-500 rounded-lg w-full">
        Save Changes
      </button>
    </Modal>
  );
};

export default RenameWishlistModal;
