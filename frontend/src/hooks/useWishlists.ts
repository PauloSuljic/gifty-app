import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../api";
import { useAuth } from "../components/AuthProvider";

export type WishlistType = {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
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
      const response = await apiFetch(`/api/wishlists/${wishlistId}/items`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems((prev) => ({ ...prev, [wishlistId]: data }));
      }
    },
    [firebaseUser]
  );

  const fetchWishlists = useCallback(async () => {
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

        const res = await apiFetch("/api/wishlists/reorder", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reordered),
        });

        if (!res.ok) {
          console.error("Failed to reorder wishlists", await res.text());
          toast.error("Failed to reorder wishlists.");
        }
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

      const response = await apiFetch("/api/wishlists", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: firebaseUser.uid,
          name: newWishlist,
          isPublic: false,
        }),
      });

      if (response.ok) {
        toast.success("Wishlist created! 🎉", {
          duration: 3000,
          position: "bottom-center",
        });
        fetchWishlists();
        return true;
      } else {
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
        toast.success(`Wishlist "${wishlistToDelete.name}" deleted 🗑️`, {
          duration: 3000,
          position: "bottom-center",
        });
        return true;
      } else {
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
