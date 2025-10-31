import { useEffect, useState } from "react";
// DnD Kit imports
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
  MouseSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableItem } from "../components/ui/SortableItem";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import WishlistItem from "../components/WishlistItem";
import { useAuth } from "../components/AuthProvider";
import { apiFetch } from "../api";
import AddItemModal from "../components/ui/modals/AddItemModal";
import EditItemModal from "../components/ui/modals/EditItemModal";
import RenameWishlistModal from "../components/ui/modals/RenameWishlistModal";
import ConfirmDeleteModal from "../components/ui/modals/ConfirmDeleteModal";
import ShareLinkModal from "../components/ui/modals/ShareLinkModal";
import { toast } from "react-hot-toast";

const WishlistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();

  const [wishlist, setWishlist] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteWishlistModalOpen, setIsDeleteWishlistModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = await firebaseUser?.getIdToken();
      if (!token) return;
      // 1. Fetch wishlist info
      const resWishlist = await apiFetch(`/api/wishlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resWishlist.ok) {
        const data = await resWishlist.json();
        setWishlist(data);
      }

      // 2. Fetch wishlist items
      const resItems = await apiFetch(`/api/wishlists/${id}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resItems.ok) {
        const data = await resItems.json();
        // Sort items by order property if present
        // Reverse so that order=0 appears last visually (match DB behavior)
        const sorted = [...data].sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
        setItems(sorted);
      }
    };
    fetchWishlist();
  }, [id, firebaseUser?.uid]);
  // Mobile detection
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );

  // Disable body scroll
  const disableBodyScroll = () => {
    document.body.style.overflow = "hidden";
  };

  // Enable body scroll
  const enableBodyScroll = () => {
    document.body.style.overflow = "";
  };

  // DnD Kit sensors
  const sensors = useSensors(
    isMobile
      ? useSensor(TouchSensor, {
          activationConstraint: {
            delay: 350,
            tolerance: 8,
          },
        })
      : useSensor(PointerSensor, {
          activationConstraint: {
            delay: 250,
            tolerance: 5,
          },
        }),
    useSensor(MouseSensor)
  );

  // Handlers for drag start and end to manage body scroll
  const handleDragStart = () => {
    disableBodyScroll();
  };

  const handleDragEndWrapper = async (event: any) => {
    enableBodyScroll();
    await handleDragEnd(event);
  };

  // DnD Kit drag end handler
const handleDragEnd = async (event: any) => {
  const { active, over } = event;

  // 1. nothing to drop on
  if (!over) return;

  // 2. dropped on itself, no-op
  if (active.id === over.id) return;

  // ❗ always work on a sorted snapshot
  const sortedByOrder = [...items].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const oldIndex = sortedByOrder.findIndex((item) => item.id === active.id);
  const newIndex = sortedByOrder.findIndex((item) => item.id === over.id);

  // 3. safety – in case ids don’t exist
  if (oldIndex === -1 || newIndex === -1) return;

  // 4. locally reorder
  const reordered = arrayMove(sortedByOrder, oldIndex, newIndex).map(
    (item, idx) => ({
      ...item,
      order: idx, // 👈 set canonical order 0..n
    })
  );

  // 5. update UI immediately
  setItems(reordered);

  // 6. persist to backend
  try {
    const token = await firebaseUser?.getIdToken();
    if (!token) return;

    await apiFetch(`/api/wishlists/${id}/items/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(
        reordered.map((i) => ({
          id: i.id,
          order: i.order,
        }))
      ),
    });
  } catch (err) {
    toast.error("Failed to reorder items.", {
      duration: 3000,
      position: "bottom-center",
    });
  }
};

  const toggleReservation = async (itemId: string) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    if (!token) return;

    try {
      const response = await apiFetch(`/api/wishlists/${id}/items/${itemId}/reserve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.error[0] === "You can only reserve 1 item per wishlist.") {
          toast.error("Max 1 item per wishlist.", {
            duration: 3000,
            position: "bottom-center",
            style: {
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
            },
          });
        } else {
          toast.error("Failed to toggle reservation.", {
            duration: 3000,
            position: "bottom-center",
          });
        }
        return;
      }

      const updatedItem = await response.json();

      toast.success(
        updatedItem.isReserved
          ? "Item reserved successfully! 🎁"
          : "Reservation removed ✅",
        {
          duration: 3000,
          position: "bottom-center",
          style: {
            background: "#333",
            color: "#fff",
            border: "1px solid #555",
          },
        }
      );

      // Update UI
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                isReserved: updatedItem.isReserved,
                reservedBy: updatedItem.reservedBy,
              }
            : i
        )
      );
    } catch (error) {
      console.error("Error toggling reservation:", error);
      toast.error("Something went wrong!", {
        duration: 3000,
        position: "bottom-center",
      });
    }
  };

  if (!wishlist) return <Layout>Loading...</Layout>;

  const isOwner = !!firebaseUser && wishlist?.userId === firebaseUser.uid;

  const isOtherUser = !!firebaseUser && !isOwner;

  const handleShareClick = async () => {
    const token = await firebaseUser?.getIdToken();
    if (!token) return;
    const response = await apiFetch(`/api/shared-links/${wishlist.id}/generate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      const generatedUrl = `${window.location.origin}/shared/${data.shareCode}`;
      setShareUrl(generatedUrl);
      setIsShareModalOpen(true);
    }
  };

  return (
    <Layout>
      {/* Header bar */}
      <div className="px-4 py-3 text-center">
        <h2 className="text-lg font-semibold">{wishlist.name}</h2>
        <p className="text-sm text-gray-400">{items.length} items</p>
      </div>

      {/* Cover card */}
      <div className="p-4">
        <div className="rounded-xl overflow-hidden shadow-md bg-[#232336]">
          <img
            src={
              wishlist.coverImage ||
              "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            }
            alt={wishlist.name}
            className="w-full h-32 object-cover"
          />
        </div>

        {/* Actions (owner only) */}
        {isOwner && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white"
            >
              + Add Item
            </button>
            <button
              onClick={handleShareClick}
              className="px-4 py-2 rounded-full border border-gray-500 text-white"
            >
              Share
            </button>
          </div>
        )}
      </div>

      {/* Items with DnD */}
      <div className="px-4 mt-6 space-y-3 select-none">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEndWrapper}
        >
          {isOwner ? (
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  {({ setNodeRef,listeners, attributes }) => (
                    <WishlistItem
                      setNodeRef={setNodeRef}
                      listeners={listeners}
                      attributes={attributes}
                      id={item.id}
                      name={item.name}
                      link={item.link}
                      isReserved={item.isReserved}
                      reservedBy={item.reservedBy}
                      wishlistOwner={wishlist.userId}
                      currentUser={firebaseUser?.uid}
                      context="own"
                      onToggleReserve={undefined}
                      onDelete={() => {
                        setItemToDelete(item);
                        setIsDeleteModalOpen(true);
                      }}
                      onEdit={() => {
                        setItemToEdit(item);
                        setIsEditModalOpen(true);
                      }}
                    />
                  )}
                </SortableItem>
              ))}
            </SortableContext>
          ) : (
            <>
              {items.map((item) => (
                <WishlistItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  link={item.link}
                  isReserved={item.isReserved}
                  reservedBy={item.reservedBy}
                  wishlistOwner={wishlist.userId}
                  currentUser={firebaseUser?.uid}
                  context={isOtherUser ? "shared" : "guest"}
                  onToggleReserve={
                    isOtherUser ? () => toggleReservation(item.id) : undefined
                  }
                  onDelete={undefined}
                  onEdit={undefined}
                />
              ))}
            </>
          )}
        </DndContext>
      </div>
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        wishlistId={wishlist.id}
        onItemAdded={(item) => {
          setItems((prev) => [...prev, item]);
          toast.success("Item added to wishlist! 🎁", {
            duration: 3000,
            position: "bottom-center",
            style: {
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
            },
          });
        }}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        wishlistId={wishlist.id}
        item={itemToEdit}
        onItemUpdated={(updated) => {
          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          toast.success("Item updated!", {
            duration: 3000,
            position: "bottom-center",
            style: {
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
            },
          });
        }}
      />

      <RenameWishlistModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        wishlist={wishlist}
        onWishlistRenamed={(updated) => {
          setWishlist(updated);
        }}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!itemToDelete) return;
          const token = await firebaseUser?.getIdToken();
          if (!token) return;
          const response = await apiFetch(`/api/wishlists/${wishlist.id}/items/${itemToDelete.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
            setIsDeleteModalOpen(false);
            toast.success(`Deleted "${itemToDelete.name}" from wishlist 🗑️`, {
              duration: 3000,
              position: "bottom-center",
              style: {
                background: "#333",
                color: "#fff",
                border: "1px solid #555",
              },
            });
          }
        }}
        itemName={itemToDelete?.name || ""}
        wishlistName={wishlist?.name}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteWishlistModalOpen}
        onClose={() => setIsDeleteWishlistModalOpen(false)}
        onConfirm={async () => {
          const token = await firebaseUser?.getIdToken();
          if (!token) return;
          const response = await apiFetch(`/api/wishlists/${wishlist.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            setIsDeleteWishlistModalOpen(false);
            navigate("/");
          }
        }}
        itemName={wishlist?.name}
      />

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />
    </Layout>
  );
};

export default WishlistDetail;