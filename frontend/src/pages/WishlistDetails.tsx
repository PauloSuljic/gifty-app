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
import WishlistDetailSidebar from "../components/WishlistDetailSidebar";
import { toast } from "react-hot-toast";
import { FiEdit2 } from "react-icons/fi";
import NotFound from "./NotFound";
import { useWishlistDetails, isValidGuid, WishlistDetailsItemType } from "../hooks/useWishlistDetails";
import { useWishlistItemsDnd } from "../hooks/useWishlistItemsDnd";
import { useShareLink } from "../hooks/useShareLink";
import { getWishlistCoverImage } from "../shared/lib/getWishlistCoverImage";

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
  const hasReservedItemByCurrentUser = items.some(
    (item) => item.isReservedByCurrentUser === true || item.reservedBy === currentUserId
  );

  const coverImageUrl = getWishlistCoverImage<WishlistDetailsItemType>({
    items,
    fallbackImage: fallbackCoverImage,
    wishlistCoverImage: wishlist.coverImage,
  });
  const desktopNoteTitle = isOwner ? "Designed for sharing" : "Keep it thoughtful";
  const desktopNoteBody = isOwner
    ? "A tighter desktop layout keeps the wishlist focused. Lead with a strong cover and the first few items people should notice."
    : "Browse the list, open product links, and reserve only the gift you genuinely plan to buy so the rest stays available.";

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-3 text-white sm:px-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <header className="space-y-3 text-center xl:col-start-1 xl:text-left">
            <div>
              {isOwner ? (
                <div className="inline-flex items-center justify-center gap-3 text-center xl:justify-start xl:text-left">
                  <h1 className="text-3xl font-semibold text-white sm:text-4xl">{wishlist.name}</h1>
                  <button
                    type="button"
                    onClick={() => setIsRenameModalOpen(true)}
                    className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-purple-300/20 bg-white/5 text-purple-300/80 transition hover:border-purple-300/40 hover:bg-white/10 hover:text-purple-200"
                    aria-label={`Rename wishlist ${wishlist.name}`}
                  >
                    <FiEdit2 className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">{wishlist.name}</h1>
              )}
              <p className="mt-2 text-base text-gray-400">{items.length} items</p>
            </div>
          </header>

          <div className="rounded-2xl overflow-hidden shadow-md bg-[#232336] border border-gray-700/70 xl:col-start-1 xl:row-start-2">
            <img
              src={coverImageUrl}
              alt={wishlist.name}
              className="h-40 w-full object-cover sm:h-52 xl:h-56"
            />
          </div>

          <div className="xl:col-start-2 xl:row-start-2">
            <WishlistDetailSidebar
              noteTitle={desktopNoteTitle}
              noteBody={desktopNoteBody}
            />
          </div>

          {isOwner && (
            <div className="flex items-center gap-3 xl:col-start-1">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="min-w-0 flex-[1.8] rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-2.5 text-base font-semibold text-white shadow-[0_10px_30px_rgba(168,85,247,0.24)] xl:w-[16rem] xl:flex-none"
              >
                + Add Item
              </button>
              <button
                type="button"
                onClick={handleShareClick}
                className="min-w-0 flex-1 rounded-full border border-gray-600 bg-gray-900/30 px-5 py-2.5 text-base font-medium text-white transition hover:border-gray-500 hover:bg-gray-800/50 xl:ml-auto xl:w-[10rem] xl:flex-none"
              >
                Share
              </button>
            </div>
          )}

          <section className="select-none xl:col-start-1">
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
                      isReservedByCurrentUser={item.isReservedByCurrentUser}
                      imageUrl={item.imageUrl}
                      description={item.description}
                      context={isOtherUser ? "shared" : "guest"}
                      hasReservedItemByCurrentUser={hasReservedItemByCurrentUser}
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
          </section>
        </div>
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
