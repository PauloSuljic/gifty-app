import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMoreVertical } from "react-icons/fi";
import Layout from "../components/layout/Layout";
import WishlistItem from "../components/WishlistItem";
import { useAuth } from "../components/AuthProvider";
import { apiFetch } from "../api";
import AddItemModal from "../components/ui/modals/AddItemModal";
import EditItemModal from "../components/ui/modals/EditItemModal";
import RenameWishlistModal from "../components/ui/modals/RenameWishlistModal";
import ConfirmDeleteModal from "../components/ui/modals/ConfirmDeleteModal";
import ShareLinkModal from "../components/ui/modals/ShareLinkModal";

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
        setItems(data);
      }
    };
    fetchWishlist();
  }, [id, firebaseUser]);

  const toggleReservation = async (itemId: string) => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    if (!token) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Guess common REST endpoints for reserve/unreserve
    const isUsersReservation = item.reservedBy === firebaseUser.uid;
    const endpoint = isUsersReservation
      ? `/api/wishlists/${id}/items/${itemId}/unreserve`
      : `/api/wishlists/${id}/items/${itemId}/reserve`;

    const response = await apiFetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      // Update local state
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                isReserved: !isUsersReservation,
                reservedBy: isUsersReservation ? null : firebaseUser.uid,
              }
            : i
        )
      );
    }
  };

  if (!wishlist) return <Layout>Loading...</Layout>;

  const isOwner = !!firebaseUser && wishlist?.userId === firebaseUser.uid;
  const isGuest = !firebaseUser;
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

      {/* Items */}
      <div className="px-4 mt-6 space-y-3">
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
            context={isOwner ? "own" : isOtherUser ? "shared" : "guest"}
            onToggleReserve={
              isOtherUser ? () => toggleReservation(item.id) : undefined
            }
            onDelete={
              isOwner
                ? () => {
                    setItemToDelete(item);
                    setIsDeleteModalOpen(true);
                  }
                : undefined
            }
            onEdit={
              isOwner
                ? () => {
                    setItemToEdit(item);
                    setIsEditModalOpen(true);
                  }
                : undefined
            }
          />
        ))}
      </div>
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        wishlistId={wishlist.id}
        onItemAdded={(item) => setItems((prev) => [...prev, item])}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        wishlistId={wishlist.id}
        item={itemToEdit}
        onItemUpdated={(updated) => {
          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        }}
      />

      <RenameWishlistModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        wishlist={wishlist}
        onWishlistRenamed={(updated) => setWishlist(updated)}
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