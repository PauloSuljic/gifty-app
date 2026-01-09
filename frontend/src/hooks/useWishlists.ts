import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "../shared/lib/apiClient";
import { useAuth } from "./useAuth";

export type WishlistType = {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
  coverImage?: string;
};

export type WishlistItemType = {
  id: string;
  name: string;
  link: string;
  wishlistId: string;
  isReserved: boolean;
  reservedBy: string;
  imageUrl?: string;
  order?: number;
  description?: string;
};

export function useWishlists() {
  const { firebaseUser } = useAuth();
  const [wishlists, setWishlists] = useState<WishlistType[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Record<string, WishlistItemType[]>>({});
  const [wishlistOrder, setWishlistOrder] = useState<string[]>([]);

  const fetchWishlistItems = useCallback(
    async (wishlistId: string) => {
      if (!firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      try {
        const data = await apiClient.get<WishlistItemType[]>(`/api/wishlists/${wishlistId}/items`, {
          token,
        });
        setWishlistItems((prev) => ({ ...prev, [wishlistId]: data }));
      } catch (error) {
        console.error("Failed to fetch wishlist items:", error);
      }
    },
    [firebaseUser]
  );

  const fetchWishlists = useCallback(async () => {
    if (!firebaseUser) return;
    const token = await firebaseUser.getIdToken();
    try {
      const data = await apiClient.get<WishlistType[]>("/api/wishlists", {
        token,
      });
      setWishlists(data);
      setWishlistOrder(data.map((w: WishlistType) => w.id));
      data.forEach((wishlist: WishlistType) => fetchWishlistItems(wishlist.id));
    } catch (error) {
      console.error("Failed to fetch wishlists:", error);
    }
  }, [firebaseUser, fetchWishlistItems]);

  useEffect(() => {
    if (firebaseUser) fetchWishlists();
  }, [firebaseUser, fetchWishlists]);

  const persistWishlistOrder = useCallback(
    async (reordered: { id: string; order: number }[]) => {
      try {
        const token = await firebaseUser?.getIdToken();
        if (!token) return;

        await apiClient.request<void>("/api/wishlists/reorder", {
          method: "PUT",
          token,
          body: reordered,
        });
      } catch (err) {
        console.error("Error:", err);
        toast.error("Something went wrong reordering wishlists.");
      }
    },
    [firebaseUser]
  );

  const createWishlist = useCallback(
    async (newWishlist: string) => {
      if (!firebaseUser) return false;
      const token = await firebaseUser.getIdToken();

      if (!newWishlist.trim()) {
        toast.error("Wishlist name cannot be empty.");
        return false;
      }
      if (newWishlist.length > 30) {
        toast.error("Wishlist name must be under 30 characters.");
        return false;
      }

      try {
        await apiClient.post<void>(
          "/api/wishlists",
          {
            userId: firebaseUser.uid,
            name: newWishlist,
            isPublic: false,
          },
          { token }
        );
        toast.success("Wishlist created! 🎉", {
          duration: 3000,
          position: "bottom-center",
        });
        fetchWishlists();
        return true;
      } catch {
        toast.error("Failed to create wishlist 😞");
        return false;
      }
    },
    [fetchWishlists, firebaseUser]
  );

  const deleteWishlist = useCallback(
    async (wishlistToDelete: { id: string; name: string }) => {
      if (!firebaseUser) return false;
      const token = await firebaseUser.getIdToken();

      try {
        await apiClient.del<void>(`/api/wishlists/${wishlistToDelete.id}`, {
          token,
        });
        setWishlists((prev) => prev.filter((w) => w.id !== wishlistToDelete.id));
        setWishlistItems((prev) => {
          const updated = { ...prev };
          delete updated[wishlistToDelete.id];
          return updated;
        });
        toast.success(`Wishlist "${wishlistToDelete.name}" deleted 🗑️`, {
          duration: 3000,
          position: "bottom-center",
        });
        return true;
      } catch {
        toast.error("Failed to delete wishlist.");
        return false;
      }
    },
    [firebaseUser]
  );

  return {
    wishlists,
    setWishlists,
    wishlistItems,
    setWishlistItems,
    wishlistOrder,
    setWishlistOrder,
    fetchWishlists,
    createWishlist,
    deleteWishlist,
    persistWishlistOrder,
  };
}
