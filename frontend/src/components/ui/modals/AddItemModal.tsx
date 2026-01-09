import { useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "../Modal";
import { apiFetch } from "../../../api";
import { useAuth } from "../../../hooks/useAuth";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId: string;
  onItemAdded: (item: WishlistItem) => void;
}

type WishlistItem = {
  id: string;
  name: string;
  link: string;
  description?: string;
  imageUrl?: string;
  reservedBy?: string | null;
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

  const isValidUrl = (value: string) =>
    /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(value.trim());

  const handleSubmit = async () => {
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

    const token = await firebaseUser?.getIdToken();
    if (!token) return;

    const response = await apiFetch(`/api/wishlists/${wishlistId}/items`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, link, description, reservedBy: null }),
    });

    if (response.ok) {
      const createdItem = await response.json();
      onItemAdded(createdItem);
      onClose();
      setName("");
      setLink("");
      setDescription("");
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
      />
      <input
        type="text"
        placeholder="Item Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="w-full px-4 py-2 mb-2 rounded bg-gray-700 text-white"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        maxLength={50}
        className="w-full px-4 py-2 mb-1 rounded bg-gray-700 text-white resize-none"
      />
      <p className="text-xs text-gray-400 mb-3 text-right">
        {description.length}/50
      </p>
      <button onClick={handleSubmit} className="w-full px-4 py-2 bg-purple-500 rounded-lg">
        Confirm
      </button>
    </Modal>
  );
};

export default AddItemModal;
