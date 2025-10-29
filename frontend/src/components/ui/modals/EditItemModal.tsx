import { useState, useEffect } from "react";
import Modal from "../Modal";
import { apiFetch } from "../../../api";
import { useAuth } from "../../AuthProvider";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId: string;
  item: { id: string; name: string; link: string } | null;
  onItemUpdated: (item: any) => void;
}

const EditItemModal = ({ isOpen, onClose, wishlistId, item, onItemUpdated }: EditItemModalProps) => {
  const { firebaseUser } = useAuth();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [errors, setErrors] = useState<{ name?: string; link?: string }>({});

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setLink(item.link || "");
    }
  }, [item]);

  const handleSubmit = async () => {
    if (!item) return;
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Item name is required.";
    if (!link.trim()) newErrors.link = "Link is required.";
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    const token = await firebaseUser?.getIdToken();
    if (!token) return;

    const response = await apiFetch(`/api/wishlists/${wishlistId}/items/${item.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, link }),
    });

    if (response.ok) {
      const updatedItem = await response.json();
      onItemUpdated(updatedItem);
      onClose();
      setErrors({});
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Edit Item</h2>
      <input
        type="text"
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 mb-2 rounded bg-gray-700 text-white"
      />
      {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
      <div className="relative mb-2">
        <input
          type="text"
          placeholder="Item Link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white pr-10"
        />
        {link && (
          <button
            type="button"
            aria-label="Clear link"
            onClick={() => setLink("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            tabIndex={0}
          >
            &#10005;
          </button>
        )}
      </div>
      {errors.link && <p className="text-red-400 text-sm">{errors.link}</p>}
      <button onClick={handleSubmit} className="w-full px-4 py-2 bg-purple-500 rounded-lg">
        Save Changes
      </button>
    </Modal>
  );
};

export default EditItemModal;