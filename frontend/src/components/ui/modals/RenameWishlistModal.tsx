import { useState, useEffect } from "react";
import Modal from "../Modal";
import { apiFetch } from "../../../api";
import { useAuth } from "../../AuthProvider";

interface RenameWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: { id: string; name: string } | null;
  onWishlistRenamed: (updated: any) => void;
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

    const response = await apiFetch(`/api/wishlists/${wishlist.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newName),
    });

    if (response.ok) {
      const updatedWishlist = await response.json();
      onWishlistRenamed(updatedWishlist);
      onClose();
      setNewName("");
      setError(null);
    } else {
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