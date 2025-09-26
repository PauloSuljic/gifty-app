import { useState } from "react";
import Modal from "../Modal";
import { apiFetch } from "../../../api";
import { useAuth } from "../../AuthProvider";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId: string;
  onItemAdded: (item: any) => void;
}

const AddItemModal = ({ isOpen, onClose, wishlistId, onItemAdded }: AddItemModalProps) => {
  const { firebaseUser } = useAuth();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [errors, setErrors] = useState<{ name?: string; link?: string }>({});

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Item name is required.";
    if (!link.trim()) newErrors.link = "Link is required.";
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    const token = await firebaseUser?.getIdToken();
    if (!token) return;

    const response = await apiFetch(`/api/wishlists/${wishlistId}/items`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, link, reservedBy: null }),
    });

    if (response.ok) {
      const createdItem = await response.json();
      onItemAdded(createdItem);
      onClose();
      setName("");
      setLink("");
      setErrors({});
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
      {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
      <input
        type="text"
        placeholder="Item Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="w-full px-4 py-2 mb-2 rounded bg-gray-700 text-white"
      />
      {errors.link && <p className="text-red-400 text-sm">{errors.link}</p>}
      <button onClick={handleSubmit} className="w-full px-4 py-2 bg-purple-500 rounded-lg">
        Confirm
      </button>
    </Modal>
  );
};

export default AddItemModal;