import { useState } from "react";
import AddItemModal from "./ui/modals/AddItemModal";
import RenameWishlistModal from "./ui/modals/RenameWishlistModal";
import { useNavigate } from "react-router-dom";
import { WishlistCard } from "./WishlistCard";
import Modal from "./ui/Modal";

import ConfirmDeleteModal from "./ui/modals/ConfirmDeleteModal";
import ShareLinkModal from "./ui/modals/ShareLinkModal";

import { DndContext } from "@dnd-kit/core";

import { SortableContext } from "@dnd-kit/sortable";
import { SortableItem } from "./ui/SortableItem";
import { useWishlists, WishlistItemType, WishlistType } from "../hooks/useWishlists";
import { useWishlistDnd } from "../hooks/useWishlistDnd";
import { useShareLink } from "../hooks/useShareLink";

const fallbackCoverImage =
  "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const Wishlist = () => {
  const navigate = useNavigate();
  const [newWishlist, setNewWishlist] = useState<string>("");
  const [selectedWishlist] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [isWishlistDeleteModalOpen, setIsWishlistDeleteModalOpen] = useState(false);
  const [wishlistToDelete, setWishlistToDelete] = useState<{ id: string; name: string } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [wishlistToRename, setWishlistToRename] = useState<WishlistType | null>(null);
  const {
    wishlists,
    setWishlists,
    wishlistItems,
    setWishlistItems,
    wishlistOrder,
    setWishlistOrder,
    createWishlist,
    deleteWishlist,
    persistWishlistOrder,
  } = useWishlists();

  const { isShareModalOpen, shareUrl, setIsShareModalOpen, generateShareLink } = useShareLink();

  const { dndContextProps, sortableStrategy } = useWishlistDnd(
    wishlistOrder,
    setWishlistOrder,
    persistWishlistOrder
  );

  const handleConfirmDelete = async () => {
    if (!wishlistToDelete) return;
    const deleted = await deleteWishlist(wishlistToDelete);
    if (deleted) {
      setIsWishlistDeleteModalOpen(false);
      setWishlistToDelete(null);
    }
  };

  const handleCreateWishlist = async () => {
    setIsCreateModalOpen(false);
    const created = await createWishlist(newWishlist);
    if (created) {
      setNewWishlist("");
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Your Wishlists</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow hover:opacity-90 transition flex items-center gap-2"
        >
          + Create Wishlist
        </button>
      </div>
  
      {wishlists.length > 0 ? (
        <DndContext {...dndContextProps}>
          <SortableContext items={wishlistOrder} strategy={sortableStrategy}>
            <div className="grid grid-cols-2 gap-4 p-4 select-none" style={{ touchAction: "pan-y" }}>
              {wishlistOrder.map((id) => {
                const wishlist = wishlists.find((w) => w.id === id);
                if (!wishlist) return null;

                return (
                  <SortableItem key={wishlist.id} id={wishlist.id}>
                    {({ listeners, attributes }) => {
                      const items = wishlistItems[wishlist.id];
                      if (!items) {
                        return (
                          <WishlistCard
                            id={wishlist.id}
                            name={wishlist.name}
                            itemCount={0}
                            coverImage={fallbackCoverImage}
                            onClick={() => navigate(`/wishlist/${wishlist.id}`)}
                            onShare={() => generateShareLink(wishlist.id)}
                            onRename={() => {
                              setWishlistToRename(wishlist);
                              setIsRenameModalOpen(true);
                            }}
                            onDelete={() => {
                              setWishlistToDelete({ id: wishlist.id, name: wishlist.name });
                              setIsWishlistDeleteModalOpen(true);
                            }}
                            listeners={listeners}
                            attributes={attributes}
                          />
                        );
                      }

                      const highestOrderedItemWithImage = items.reduce<WishlistItemType | null>(
                        (best, item) => {
                          if (!item.imageUrl) return best;

                          if (!best) return item;

                          const bestOrder = best.order ?? 0;
                          const itemOrder = item.order ?? 0;

                          return itemOrder > bestOrder ? item : best;
                        },
                        null
                      );

                      const coverImageUrl =
                        highestOrderedItemWithImage?.imageUrl || fallbackCoverImage;

                      return (
                        <WishlistCard
                          id={wishlist.id}
                          name={wishlist.name}
                          itemCount={items.length}
                          coverImage={coverImageUrl}
                          onClick={() => navigate(`/wishlist/${wishlist.id}`)}
                          onShare={() => generateShareLink(wishlist.id)}
                          onRename={() => {
                            setWishlistToRename(wishlist);
                            setIsRenameModalOpen(true);
                          }}
                          onDelete={() => {
                            setWishlistToDelete({ id: wishlist.id, name: wishlist.name });
                            setIsWishlistDeleteModalOpen(true);
                          }}
                          listeners={listeners}
                          attributes={attributes}
                        />
                      );
                    }}
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
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wishlistId={selectedWishlist!}
        onItemAdded={(item) => {
          setWishlistItems((prev) => ({
            ...prev,
            [selectedWishlist!]: [...(prev[selectedWishlist!] || []), item],
          }));
        }}
      />

      <RenameWishlistModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        wishlist={wishlistToRename}
        onWishlistRenamed={(updated) => {
          setWishlists((prev) =>
            prev.map((w) => (w.id === updated.id ? { ...w, name: updated.name } : w))
          );
        }}
      />

      {/* ✅ Delete Wishlist Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isWishlistDeleteModalOpen}
        onClose={() => setIsWishlistDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
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
          onClick={handleCreateWishlist}
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
