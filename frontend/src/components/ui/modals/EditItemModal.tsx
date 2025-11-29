import { useState, useEffect } from "react";
import Modal from "../Modal";
import { useAuth } from "../../AuthProvider";
import { toast } from "react-hot-toast";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId: string;
  item: { id: string; name: string; link: string; imageUrl?: string } | null;
  onItemUpdated: (item: any) => void;
}

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const EditItemModal = ({ isOpen, onClose, wishlistId, item, onItemUpdated }: EditItemModalProps) => {
  const { firebaseUser } = useAuth();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");

  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setLink(item.link || "");

      const clean = item.imageUrl && item.imageUrl.trim() !== "" ? item.imageUrl : null;

      setExistingImage(clean);
      setPreviewUrl(null);
      setNewImageFile(null);
    }
  }, [item]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!item) return;

    // VALIDATION — one toast per problem
    if (!name.trim()) {
      toast.error("Item name is required.", {
        position: "bottom-center",
      });
      return;
    }

    if (!link.trim()) {
      toast.error("Item link is required.", {
        position: "bottom-center",
      });
      return;
    }

    if (!isValidUrl(link.trim())) {
      toast.error("Please enter a valid URL.", {
        position: "bottom-center",
      });
      return;
    }

    const token = await firebaseUser?.getIdToken();
    if (!token) return;

    // CASE A — only name/link updated
    if (!newImageFile) {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/wishlists/${wishlistId}/items/${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, link }),
        }
      );

      if (!res.ok) {
        toast.error("Could not update item.", {
          position: "bottom-center",
        });
        return;
      }

      const updated = await res.json();
      onItemUpdated(updated);

      toast.success("Item updated!", {
        duration: 3000,
        position: "bottom-center",
        style: {
          background: "#333",
          color: "#fff",
          border: "1px solid #555",
        },
      });

      onClose();
      return;
    }

    // CASE B — image updated + (optional) name/link
    const formData = new FormData();
    formData.append("image", newImageFile);
    formData.append("name", name);
    formData.append("link", link);

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/wishlists/${wishlistId}/items/${item.id}/image`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    if (!res.ok) {
      toast.error("Could not update item image.", {
        position: "bottom-center",
      });
      return;
    }

    const updated = await res.json();
    onItemUpdated(updated);

    toast.success("Item updated!", {
      duration: 3000,
      position: "bottom-center",
      style: {
        background: "#333",
        color: "#fff",
        border: "1px solid #555",
      },
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-3">Edit Item</h2>

        {/* IMAGE PREVIEW */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={
              previewUrl ||
              existingImage ||
              "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop"
            }
            alt="Item preview"
            className="w-32 h-32 rounded-lg object-cover shadow-lg mb-2 border border-gray-600"
          />

          <label className="cursor-pointer bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
            Change Image
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
      </div>

      {/* NAME INPUT */}
      <input
        type="text"
        placeholder="Item Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 mb-2 rounded bg-gray-700 text-white"
      />

      {/* LINK INPUT */}
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
          >
            &#10005;
          </button>
        )}
      </div>

      <button onClick={handleSubmit} className="w-full px-4 py-2 mt-3 bg-purple-500 rounded-lg">
        Save Changes
      </button>
    </Modal>
  );
};

export default EditItemModal;