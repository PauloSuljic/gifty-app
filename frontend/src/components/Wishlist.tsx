import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import Card from "./ui/Card";
import WishlistItem from "./WishlistItem";
import Modal from "./ui/Modal";
import { FiTrash2, FiLink, FiPlus, FiEdit, FiMoreVertical } from "react-icons/fi";
import ConfirmDeleteModal from "./ui/modals/ConfirmDeleteModal";
import ShareLinkModal from "./ui/modals/ShareLinkModal";
import { apiFetch } from "../api";
import toast from "react-hot-toast";
import { Menu } from "@headlessui/react";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {SortableItem} from './ui/SortableItem';

// Define TypeScript types
type WishlistType = {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
};

type WishlistItemType = {
  id: string;
  name: string;
  link: string;
  wishlistId: string;
  isReserved: boolean;
  reservedBy: string;
};

const Wishlist = () => {
  const { firebaseUser } = useAuth();
  const [wishlists, setWishlists] = useState<WishlistType[]>([]);
  const [wishlistItems, setWishlistItems] = useState<{ [key: string]: WishlistItemType[] }>({});
  const [newWishlist, setNewWishlist] = useState<string>(""); 
  const [selectedWishlist, setSelectedWishlist] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<{ name: string; link: string }>({ name: "", link: "" });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; wishlistId: string; wishlistName: string } | null>(null);

  const [isWishlistDeleteModalOpen, setIsWishlistDeleteModalOpen] = useState(false);
  const [wishlistToDelete, setWishlistToDelete] = useState<{ id: string; name: string } | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const [wishlistOrder, setWishlistOrder] = useState<string[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 🔽 New state for edit functionality
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<{ id: string; name: string; link: string; wishlistId: string }>({
    id: "",
    name: "",
    link: "",
    wishlistId: ""
  });

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [wishlistToRename, setWishlistToRename] = useState<{ id: string; name: string } | null>(null);
  const [newWishlistName, setNewWishlistName] = useState("");

  const [expandedWishlistIds, setExpandedWishlistIds] = useState<string[]>([]);

  const [errors, setErrors] = useState<{ name?: string; link?: string }>({});

  const [renameError, setRenameError] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseUser) fetchWishlists();
  }, [firebaseUser]);

  const fetchWishlists = async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await apiFetch("/api/wishlists", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      setWishlists(data);
      setWishlistOrder(data.map((w: WishlistType) => w.id)); 
      data.forEach((wishlist: WishlistType) => fetchWishlistItems(wishlist.id));

      // Expand first item in wishlist
      // if (data.length > 0) {
      //   setExpandedWishlistIds([data[0].id]);
      // }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over || active.id === over.id) return;
  
    const oldIndex = wishlistOrder.indexOf(active.id as string);
    const newIndex = wishlistOrder.indexOf(over.id as string);
  
    const newOrder = arrayMove(wishlistOrder, oldIndex, newIndex);
    setWishlistOrder(newOrder);
  
    // Update order in backend
    const reordered = newOrder.map((id, index) => ({
      id,
      order: index,
    }));
  
    const token = await firebaseUser?.getIdToken();
    await apiFetch("/api/wishlists/reorder", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reordered),
    });
  };
  
  const createWishlist = async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();

    if (!newWishlist.trim()) {
      toast.error("Wishlist name cannot be empty.");
      return;
    }
    if (newWishlist.length > 30) {
      toast.error("Wishlist name must be under 30 characters.");
      return;
    }    
  
    const response = await apiFetch("/api/wishlists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: firebaseUser.uid,
        name: newWishlist,
        isPublic: false
      }),
    });
  
    if (response.ok) {
      toast.success("Wishlist created! 🎉", {
        duration: 3000,
        position: "bottom-center",
      });
      fetchWishlists();
      setNewWishlist("");
    } else {
      toast.error("Failed to create wishlist 😞");
    }
  };  

  const deleteWishlist = async () => {
    if (!firebaseUser || !wishlistToDelete) return;
    const token = await firebaseUser.getIdToken();
  
    const response = await apiFetch(`/api/wishlists/${wishlistToDelete.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (response.ok) {
      setWishlists((prev) => prev.filter((w) => w.id !== wishlistToDelete.id));
      setWishlistItems((prev) => {
        const updated = { ...prev };
        delete updated[wishlistToDelete.id];
        return updated;
      });
  
      setIsWishlistDeleteModalOpen(false);
      setWishlistToDelete(null);
      toast.success(`Wishlist "${wishlistToDelete.name}" deleted 🗑️`, {
        duration: 3000,
        position: "bottom-center",
      });
    } else {
      toast.error("Failed to delete wishlist.");
    }
  };  

  const fetchWishlistItems = async (wishlistId: string) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await apiFetch(`/api/wishlist-items/${wishlistId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      setWishlistItems((prev) => ({ ...prev, [wishlistId]: data }));
    }
  };

  const addWishlistItem = async () => {
    const newErrors: typeof errors = {};
  
    // Validate item name
    if (!newItem.name.trim()) {
      newErrors.name = "Item name is required.";
    } else if (newItem.name.length > 30) {
      newErrors.name = "Item name must be under 30 characters.";
    }
  
    // Validate link
    const isValidUrl = (str: string) => {
      try {
        new URL(str);
        return true;
      } catch {
        return false;
      }
    };
  
    if (!newItem.link.trim()) {
      newErrors.link = "Link is required.";
    } else if (!isValidUrl(newItem.link)) {
      newErrors.link = "Enter a valid URL (e.g., https://example.com)";
    }
  
    // If validation fails, show errors and exit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    // ✅ Clear errors if all good
    setErrors({});
  
    if (!selectedWishlist || !firebaseUser) return;
  
    const token = await firebaseUser.getIdToken();
    const response = await apiFetch("/api/wishlist-items", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: newItem.name,
        link: newItem.link,
        wishlistId: selectedWishlist,
        reservedBy: null
      }),
    });
  
    if (response.ok) {
      const createdItem = await response.json();
      setWishlistItems((prev) => ({
        ...prev,
        [selectedWishlist]: [...(prev[selectedWishlist] || []), createdItem],
      }));
  
      setNewItem({ name: "", link: "" });
      setIsModalOpen(false);
  
      toast.success("Item added to wishlist! 🎁", {
        duration: 3000,
        position: "bottom-center"
      });
    } else {
      console.error("Error adding item:", await response.json());
      toast.error("Failed to add item. 😞", {
        duration: 3000,
        position: "bottom-center"
      });
    }
  };  

  const deleteWishlistItem = async () => {
    if (!firebaseUser || !itemToDelete) return;
    const { id, wishlistId, name } = itemToDelete;
    const token = await firebaseUser.getIdToken();
  
    const response = await apiFetch(`/api/wishlist-items/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
  
    if (response.ok) {
      setWishlistItems((prev) => ({
        ...prev,
        [wishlistId]: prev[wishlistId].filter((item) => item.id !== id),
      }));
      setIsDeleteModalOpen(false);
      toast.success(`Deleted "${name}" from wishlist 🗑️`, {
        duration: 3000,
        position: "bottom-center",
      });
    } else {
      toast.error("Failed to delete item.");
    }
  };  

  const toggleReservation = async (wishlistId: string, itemId: string) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    const response = await apiFetch(`/api/wishlist-items/${itemId}/reserve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });

    if (response.ok) {
      const updatedItem = await response.json();
      setWishlistItems((prev) => ({
        ...prev,
        [wishlistId]: prev[wishlistId].map((item) =>
          item.id === itemId ? { ...item, isReserved: updatedItem.isReserved } : item
        ),
      }));
    }
  };

  const generateShareLink = async (wishlistId: string) => {
    const token = await firebaseUser?.getIdToken();
    const response = await apiFetch(`/api/shared-links/${wishlistId}/generate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (response.ok) {
      const data = await response.json();
      const generatedUrl = `${window.location.origin}/shared/${data.shareCode}`;
  
      setShareUrl(generatedUrl); 
      setIsShareModalOpen(true); 
    } else {
      console.error("Error generating share link:", await response.json());
    }
  };

  // 🔽 Function to open edit modal
  const openEditModal = (item: WishlistItemType, wishlistId: string) => {
    setItemToEdit({ id: item.id, name: item.name, link: item.link, wishlistId });
    setIsEditModalOpen(true);
  };

  // 🔽 Function to update wishlist item
  const updateWishlistItem = async () => {
    const newErrors: typeof errors = {};
  
    if (!itemToEdit.name.trim()) {
      newErrors.name = "Item name is required.";
    } else if (itemToEdit.name.length > 30) {
      newErrors.name = "Name must be under 30 characters.";
    }
  
    const isValidUrl = (str: string) => {
      try {
        new URL(str);
        return true;
      } catch {
        return false;
      }
    };
  
    if (!itemToEdit.link.trim()) {
      newErrors.link = "Link is required.";
    } else if (!isValidUrl(itemToEdit.link)) {
      newErrors.link = "Enter a valid URL (e.g., https://example.com)";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setErrors({});
    const token = await firebaseUser?.getIdToken();
    if (!token) return;
  
    const response = await apiFetch(`/api/wishlist-items/${itemToEdit.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: itemToEdit.name,
        link: itemToEdit.link
      })
    });
  
    if (response.ok) {
      const updated = await response.json();
      setWishlistItems((prev) => ({
        ...prev,
        [itemToEdit.wishlistId]: prev[itemToEdit.wishlistId].map((item) =>
          item.id === updated.id ? updated : item
        )
      }));
      setIsEditModalOpen(false);
      toast.success("Item updated!", {
        position: "bottom-center",
        duration: 3000,
        icon: "✅",
      });
    } else {
      toast.error("Something went wrong!", {
        position: "bottom-center",
        duration: 3000,
        icon: "❌",
      });
    }
  };  

  const renameWishlist = async () => {
    if (!firebaseUser || !wishlistToRename) return;
  
    if (!newWishlistName.trim()) {
      setRenameError("Name is required.");
      return;
    }
    if (newWishlistName.length > 30) {
      setRenameError("Name must be under 30 characters.");
      return;
    }
  
    const token = await firebaseUser.getIdToken();
  
    const response = await apiFetch(`/api/wishlists/${wishlistToRename.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newWishlistName)
    });
  
    if (response.ok) {
      toast.success("Wishlist renamed!");
      fetchWishlists();
      setIsRenameModalOpen(false);
      setWishlistToRename(null);
      setNewWishlistName("");
      setRenameError(null);
    } else {
      toast.error("Failed to rename wishlist.");
    }
  };  

  const toggleWishlistDropdown = (wishlistId: string) => {
    setExpandedWishlistIds((prev) =>
      prev.includes(wishlistId)
        ? prev.filter((id) => id !== wishlistId)
        : [...prev, wishlistId]
    );
  };

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 300,
      tolerance: 5,
    },
  });
  
  const mouseSensor = useSensor(MouseSensor); // Optional: desktop support

  const sensors = useSensors(touchSensor, mouseSensor);
  
  return (
    <div className="max-w-4xl mx-auto text-white">
      {/* Create New Wishlist */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-1.5 rounded-md bg-purple-500 hover:bg-purple-600 transition shadow-md"
        >
          Create Wishlist
        </button>
      </div>
  
      {wishlists.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >      
          <SortableContext items={wishlistOrder} strategy={verticalListSortingStrategy}>
          <div className="columns-1 md:columns-2 gap-6 space-y-6 sm:px-4 overflow-x-visible">
              {wishlistOrder.map((id) => {
                const wishlist = wishlists.find((w) => w.id === id);
                if (!wishlist) return null;

                return (
                  <SortableItem key={wishlist.id} id={wishlist.id}>
                    {({ listeners, attributes }) => (
                      <div className="relative pl-6">
                        {/* 🟣 Drag Handle - placed outside the Card to the left */}
                        <div
                          {...listeners}
                          {...attributes}
                          className="absolute -left-1 top-1/2 -translate-y-1/2 flex flex-col items-center text-gray-400 hover:text-purple-400 cursor-grab active:cursor-grabbing z-20"
                          title="Drag to reorder"
                        >
                          <span className="text-xs leading-none">▲</span>
                          <span className="text-xs leading-none">▼</span>
                        </div>
                
                        {/* 💳 Card Content */}
                        <Card className="relative break-inside-avoid mb-6">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            {/* Wishlist Title & Expand Button */}
                            <button
                              onClick={() => toggleWishlistDropdown(wishlist.id)}
                              className="flex-1 text-left text-lg font-semibold text-white pl-2"
                            >
                              {wishlist.name}
                              <span className="ml-2 text-sm text-gray-400">
                                {expandedWishlistIds.includes(wishlist.id) ? "▲" : "▼"}
                              </span>
                            </button>
                
                            {/* 🔧 Dropdown Menu */}
                            <div className="relative">
                              <Menu as="div" className="relative inline-block text-left z-20">
                                <Menu.Button className="p-2 text-white hover:text-purple-400 transition">
                                  <FiMoreVertical size={20} />
                                </Menu.Button>

                                <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-gray-700 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  <div className="py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => generateShareLink(wishlist.id)}
                                          className={`${
                                            active ? "bg-gray-700" : ""
                                          } flex items-center w-full px-4 py-2 text-base text-white gap-2`}
                                        >
                                          <FiLink /> Share
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => {
                                            setWishlistToRename({ id: wishlist.id, name: wishlist.name });
                                            setNewWishlistName(wishlist.name);
                                            setIsRenameModalOpen(true);
                                          }}
                                          className={`${
                                            active ? "bg-gray-700" : ""
                                          } flex items-center w-full px-4 py-2 text-base text-white gap-2`}
                                        >
                                          <FiEdit /> Rename
                                        </button>
                                      )}
                                    </Menu.Item>
                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => {
                                            setWishlistToDelete({ id: wishlist.id, name: wishlist.name });
                                            setIsWishlistDeleteModalOpen(true);
                                          }}
                                          className={`${
                                            active ? "bg-red-700" : ""
                                          } flex items-center w-full px-4 py-2 text-base text-red-400 gap-2`}
                                        >
                                          <FiTrash2 /> Delete
                                        </button>
                                      )}
                                    </Menu.Item>
                                  </div>
                                </Menu.Items>
                              </Menu>
                            </div>
                          </div>
                
                          {/* Collapsible Content */}
                          <div
                            className={`
                              transition-all duration-500 ease-in-out overflow-hidden
                              ${expandedWishlistIds.includes(wishlist.id)
                                ? "max-h-[1000px] opacity-100 mt-4"
                                : "max-h-0 opacity-0 mt-0"}
                            `}
                          >
                            <button
                              onClick={() => {
                                setSelectedWishlist(wishlist.id);
                                setIsModalOpen(true);
                              }}
                              className="px-4 py-2 mb-4 h-8 bg-purple-500 rounded-lg transition hover:bg-purple-600 w-full flex items-center justify-center space-x-2"
                            >
                              <FiPlus />
                              <span>Add Item</span>
                            </button>
                
                            {/* Wishlist Items */}
                            <div className="space-y-3">
                              {wishlistItems[wishlist.id]?.map((item) => (
                                <WishlistItem
                                  key={item.id}
                                  id={item.id}
                                  name={item.name}
                                  link={item.link}
                                  isReserved={item.isReserved}
                                  reservedBy={item.reservedBy}
                                  context="own"
                                  wishlistOwner={wishlist.userId}
                                  currentUser={firebaseUser?.uid}
                                  onDelete={() => {
                                    setItemToDelete({
                                      id: item.id,
                                      name: item.name,
                                      wishlistId: wishlist.id,
                                      wishlistName: wishlist.name,
                                    });
                                    setIsDeleteModalOpen(true);
                                  }}
                                  onToggleReserve={() => toggleReservation(wishlist.id, item.id)}
                                  onEdit={() => openEditModal(item, wishlist.id)}
                                />
                              ))}
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </SortableItem>
                );                
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-gray-300 text-center">No wishlists found. Create one to get started!</p>
      )}
  
      {/* Modal for Adding Items */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Add Item</h2>

        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => {
            setNewItem({ ...newItem, name: e.target.value });
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          maxLength={30}
          className={`w-full px-4 py-2 rounded bg-gray-700 text-white mb-2 border ${
            errors.name ? "border-red-500" : "border-transparent"
          }`}
        />
        {errors.name && (
          <p className="text-red-400 text-sm mb-2">{errors.name}</p>
        )}

        <input
          type="text"
          placeholder="Item Link"
          value={newItem.link}
          onChange={(e) => {
            setNewItem({ ...newItem, link: e.target.value });
            setErrors((prev) => ({ ...prev, link: undefined }));
          }}
          className={`w-full px-4 py-2 rounded bg-gray-700 text-white mb-2 border ${
            errors.link ? "border-red-500" : "border-transparent"
          }`}
        />
        {errors.link && (
          <p className="text-red-400 text-sm mb-2">{errors.link}</p>
        )}

        <button
          onClick={addWishlistItem}
          className="px-4 py-2 bg-purple-500 rounded-lg w-full"
        >
          Confirm
        </button>
      </Modal>    

      {/* ✅ Modal for Editing Items */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Edit Item</h2>
        <input
          type="text"
          placeholder="Item Name"
          value={itemToEdit.name}
          onChange={(e) => {
            setItemToEdit({ ...itemToEdit, name: e.target.value });
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          maxLength={30}
          className={`w-full px-4 py-2 rounded bg-gray-700 text-white mb-2 border ${
            errors.name ? "border-red-500" : "border-transparent"
          }`}
        />
        {errors.name && <p className="text-red-400 text-sm mb-2">{errors.name}</p>}

        <input
          type="text"
          placeholder="Item Link"
          value={itemToEdit.link}
          onChange={(e) => {
            setItemToEdit({ ...itemToEdit, link: e.target.value });
            setErrors((prev) => ({ ...prev, link: undefined }));
          }}
          className={`w-full px-4 py-2 rounded bg-gray-700 text-white mb-2 border ${
            errors.link ? "border-red-500" : "border-transparent"
          }`}
        />
        {errors.link && <p className="text-red-400 text-sm mb-2">{errors.link}</p>}

        <button onClick={updateWishlistItem} className="px-4 py-2 bg-purple-500 rounded-lg w-full">
          Save Changes
        </button>
      </Modal>      

      <Modal isOpen={isRenameModalOpen} onClose={() => setIsRenameModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Rename Wishlist</h2>
        <input
          type="text"
          placeholder="New wishlist name"
          value={newWishlistName}
          onChange={(e) => {
            setNewWishlistName(e.target.value);
            setRenameError(null);
          }}
          maxLength={30}
          className={`w-full px-4 py-2 rounded bg-gray-700 text-white mb-2 border ${
            renameError ? "border-red-500" : "border-transparent"
          }`}
        />
        {renameError && <p className="text-red-400 text-sm mb-2">{renameError}</p>}
        <button onClick={renameWishlist} className="px-4 py-2 bg-purple-500 rounded-lg w-full">
          Save Changes
        </button>
      </Modal>  

      {/* ✅ Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteWishlistItem}
        itemName={itemToDelete?.name || ""}
        wishlistName={itemToDelete?.wishlistName || ""}
      />

      {/* ✅ Delete Wishlist Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isWishlistDeleteModalOpen}
        onClose={() => setIsWishlistDeleteModalOpen(false)}
        onConfirm={deleteWishlist}
        itemName={wishlistToDelete?.name || ""}
      />

      <ShareLinkModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        shareUrl={shareUrl}
      />

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">New Wishlist</h2>
        <input
          type="text"
          value={newWishlist}
          onChange={(e) => setNewWishlist(e.target.value)}
          placeholder="Wishlist Name"
          maxLength={30}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white mb-4"
        />
        <button
          onClick={() => {
            createWishlist();
            setIsCreateModalOpen(false);
          }}
          className="px-4 py-2 bg-purple-500 rounded-lg w-full"
          disabled={!newWishlist.trim()}
        >
          Create
        </button>
      </Modal>

    </div>
  );
};

export default Wishlist;
