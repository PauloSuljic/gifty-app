import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "../Modal";
import { apiClient } from "../../../shared/lib/apiClient";
import { useAuth } from "../../../hooks/useAuth";
import type { WishlistItemType } from "../../../hooks/useWishlists";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId: string;
  onItemAdded: (item: WishlistItemType) => void;
};

type AddItemErrors = {
  name?: string;
  link?: string;
};

const AddItemModal = ({ isOpen, onClose, wishlistId, onItemAdded }: AddItemModalProps) => {
  const { firebaseUser } = useAuth();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const isValidUrl = (value: string) =>
    /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(value.trim());

  const handleSubmit = async () => {
    if (isSubmittingRef.current) {
      return;
    }

    const newErrors: AddItemErrors = {};
    if (!name.trim()) newErrors.name = "Item name is required.";
    if (!link.trim()) newErrors.link = "Link is required.";
    if (link.trim() && !isValidUrl(link)) newErrors.link = "Please enter a valid URL.";
    if (Object.keys(newErrors).length) {
      Object.values(newErrors).forEach((msg) => toast.error(msg, {
        duration: 3000,
        position: "bottom-center",
        style: { background: "#333", color: "#fff", border: "1px solid #555" }
      }));
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const token = await firebaseUser?.getIdToken();
      if (!token) {
        return;
      }

      const createdItem = await apiClient.post<WishlistItemType>(
        `/api/wishlists/${wishlistId}/items`,
        { name, link, description, reservedBy: null },
        { token }
      );
      onItemAdded(createdItem);
      onClose();
      setName("");
      setLink("");
      setDescription("");
    } catch (error) {
      console.error("Failed to add wishlist item:", error);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Add Item</h2>
      <input
        type="text"
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 mb-2 rounded bg-gray-700 text-white"
        disabled={isSubmitting}
      />
      <input
        type="text"
        placeholder="Item Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="w-full px-4 py-2 mb-2 rounded bg-gray-700 text-white"
        disabled={isSubmitting}
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        maxLength={50}
        className="w-full px-4 py-2 mb-1 rounded bg-gray-700 text-white resize-none"
        disabled={isSubmitting}
      />
      <p className="text-xs text-gray-400 mb-3 text-right">
        {description.length}/50
      </p>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`w-full px-4 py-2 rounded-lg ${
          isSubmitting ? "bg-gray-600 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-400"
        }`}
      >
        {isSubmitting ? "Adding..." : "Confirm"}
      </button>
    </Modal>
  );
};

export default AddItemModal;
