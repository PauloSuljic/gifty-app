import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { SortableItem } from "../components/ui/SortableItem";
import { useParams, useNavigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import WishlistItem from "../components/WishlistItem";
import AddItemModal from "../components/ui/modals/AddItemModal";
import EditItemModal from "../components/ui/modals/EditItemModal";
import RenameWishlistModal from "../components/ui/modals/RenameWishlistModal";
import ConfirmDeleteModal from "../components/ui/modals/ConfirmDeleteModal";
import ShareLinkModal from "../components/ui/modals/ShareLinkModal";
import { toast } from "react-hot-toast";
import NotFound from "./NotFound";
import { useWishlistDetails, isValidGuid, WishlistDetailsItemType } from "../hooks/useWishlistDetails";
import { useWishlistItemsDnd } from "../hooks/useWishlistItemsDnd";
import { useShareLink } from "../hooks/useShareLink";

const WishlistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isValidId = isValidGuid(id);
  const {
    wishlist,
    items,
    setItems,
    error,
    isOwner,
    isOtherUser,
    persistItemOrder,
    toggleReservation,
    handleItemAdded,
    handleItemUpdated,
    handleWishlistRenamed,
    deleteItem,
    deleteWishlist,
    currentUserId,
  } = useWishlistDetails(isValidId ? id : undefined);
  const { dndContextProps, sortableStrategy } = useWishlistItemsDnd(items, setItems, persistItemOrder);
  const { isShareModalOpen, shareUrl, setIsShareModalOpen, generateShareLink } = useShareLink();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteWishlistModalOpen, setIsDeleteWishlistModalOpen] = useState(false);

  const [itemToEdit, setItemToEdit] = useState<WishlistDetailsItemType | null>(null);
  const [itemToDelete, setItemToDelete] = useState<WishlistDetailsItemType | null>(null);

  if (!isValidId) {
    return <NotFound />;
  }

  if (error) {
    return <NotFound />;
  }

  if (!wishlist) {
    return <Spinner />;
  }

  const handleShareClick = async () => {
    if (!wishlist) return;
    await generateShareLink(wishlist.id);
  };

  const fallbackCoverImage =
    "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // Pick item with the highest `order` that has an image
  const highestOrderedItemWithImage = items.reduce<WishlistDetailsItemType | null>(
    (best, item) => {
      if (!item.imageUrl) return best; // skip items without image

      if (!best) return item; // first candidate

      const bestOrder = best.order ?? 0;
      const itemOrder = item.order ?? 0;

      return itemOrder > bestOrder ? item : best;
    },
    null
  );

  const coverImageUrl =
    wishlist.coverImage ||
    highestOrderedItemWithImage?.imageUrl ||
    fallbackCoverImage;

  return (
    <>
      {/* Header bar */}
      <div className="px-4 py-3 text-center">
        <h2 className="text-lg font-semibold">{wishlist.name}</h2>
        <p className="text-sm text-gray-400">{items.length} items</p>
      </div>

      {/* Cover card */}
      <div className="p-4">
        <div className="rounded-xl overflow-hidden shadow-md bg-[#232336]">
          <img
            src={coverImageUrl}
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
        <DndContext {...dndContextProps}>
          {isOwner ? (
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={sortableStrategy}
            >
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id}>
                  {({ setNodeRef, listeners, attributes }) => (
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
                      currentUser={currentUserId}
                      imageUrl={item.imageUrl}
                      description={item.description}
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
                  currentUser={currentUserId}
                  imageUrl={item.imageUrl}
                  description={item.description}
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
          handleItemAdded(item);
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
          handleItemUpdated(updated);
        }}
      />

      <RenameWishlistModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        wishlist={wishlist}
        onWishlistRenamed={(updated) => {
          handleWishlistRenamed(updated);
        }}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!itemToDelete) return;
          const deleted = await deleteItem(itemToDelete.id);
          if (!deleted) return;

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
        }}
        itemName={itemToDelete?.name || ""}
        wishlistName={wishlist?.name}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteWishlistModalOpen}
        onClose={() => setIsDeleteWishlistModalOpen(false)}
        onConfirm={async () => {
          const deleted = await deleteWishlist();
          if (!deleted) return;

          setIsDeleteWishlistModalOpen(false);
          navigate("/");
        }}
        itemName={wishlist?.name}
      />

      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
      />
    </>
  );
};

export default WishlistDetail;
