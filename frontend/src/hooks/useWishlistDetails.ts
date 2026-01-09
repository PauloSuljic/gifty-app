import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ApiError, apiClient } from "../shared/lib/apiClient";
import { useAuth } from "./useAuth";
import { useNotificationContext } from "../context/useNotificationContext";
import { WishlistItemType, WishlistType } from "./useWishlists";

export type WishlistDetailsType = WishlistType;
export type WishlistDetailsItemType = WishlistItemType;

export const isValidGuid = (value: string | undefined) =>
  !!value && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);

export function useWishlistDetails(wishlistId?: string) {
  const { firebaseUser } = useAuth();
  const { refreshNotifications } = useNotificationContext();

  const [wishlist, setWishlist] = useState<WishlistDetailsType | null>(null);
  const [items, setItems] = useState<WishlistDetailsItemType[]>([]);
  const [error, setError] = useState(false);

  const fetchWishlistDetails = useCallback(async () => {
    if (!firebaseUser || !wishlistId) return;

    const token = await firebaseUser.getIdToken();

    try {
      const wishlistData = await apiClient.get<WishlistDetailsType>(`/api/wishlists/${wishlistId}`, {
        token,
      });
      setWishlist(wishlistData);
    } catch {
      setError(true);
      return;
    }

    try {
      const itemsData = await apiClient.get<WishlistDetailsItemType[]>(
        `/api/wishlists/${wishlistId}/items`,
        { token }
      );
      const sorted = [...itemsData].sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
      setItems(sorted);
    } catch {
      setError(true);
    }
  }, [firebaseUser, wishlistId]);

  useEffect(() => {
    setError(false);
    setWishlist(null);
    setItems([]);

    if (firebaseUser) {
      fetchWishlistDetails();
    }
  }, [fetchWishlistDetails, firebaseUser]);

  const persistItemOrder = useCallback(
    async (reordered: WishlistDetailsItemType[]) => {
      try {
        const token = await firebaseUser?.getIdToken();
        if (!token || !wishlistId) return;

        await apiClient.request<void>(`/api/wishlists/${wishlistId}/items/reorder`, {
          method: "PUT",
          token,
          body: reordered.map((item, index) => ({
            id: item.id,
            order: index,
          })),
        });
      } catch (error) {
        console.error("Error reordering wishlist items:", error);
        toast.error("Failed to reorder items.", {
          duration: 3000,
          position: "bottom-center",
        });
      }
    },
    [firebaseUser, wishlistId]
  );

  const toggleReservation = useCallback(
    async (itemId: string) => {
      if (!firebaseUser || !wishlistId) return;
      const token = await firebaseUser.getIdToken();
      if (!token) return;

      try {
        const updatedItem = await apiClient.patch<WishlistDetailsItemType>(
          `/api/wishlists/${wishlistId}/items/${itemId}/reserve`,
          undefined,
          { token }
        );

        toast.success(
          updatedItem.isReserved ? "Item reserved successfully! 🎁" : "Reservation removed ✅",
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

        if (wishlist?.userId === firebaseUser.uid && updatedItem.reservedBy !== firebaseUser.uid) {
          refreshNotifications();
        }
      } catch (err) {
        if (err instanceof ApiError) {
          const details = err.details as { error?: string[] } | undefined;
          if (details?.error?.[0] === "You can only reserve 1 item per wishlist.") {
            toast.error("Max 1 item per wishlist.", {
              duration: 3000,
              position: "bottom-center",
              style: {
                background: "#333",
                color: "#fff",
                border: "1px solid #555",
              },
            });
            return;
          }
          toast.error("Failed to toggle reservation.", {
            duration: 3000,
            position: "bottom-center",
          });
          return;
        }

        console.error("Error toggling reservation:", err);
        toast.error("Something went wrong!", {
          duration: 3000,
          position: "bottom-center",
        });
      }
    },
    [firebaseUser, refreshNotifications, wishlist, wishlistId]
  );

  const handleItemAdded = useCallback((item: WishlistDetailsItemType) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const handleItemUpdated = useCallback((updated: WishlistDetailsItemType) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }, []);

  const handleWishlistRenamed = useCallback((updated: WishlistDetailsType) => {
    setWishlist(updated);
  }, []);

  const deleteItem = useCallback(
    async (itemId: string) => {
      const token = await firebaseUser?.getIdToken();
      if (!token || !wishlistId) return false;

      try {
        await apiClient.del<void>(`/api/wishlists/${wishlistId}/items/${itemId}`, {
          token,
        });
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        return true;
      } catch {
        return false;
      }
    },
    [firebaseUser, wishlistId]
  );

  const deleteWishlist = useCallback(async () => {
    const token = await firebaseUser?.getIdToken();
    if (!token || !wishlistId) return false;
    try {
      await apiClient.del<void>(`/api/wishlists/${wishlistId}`, { token });
      return true;
    } catch {
      return false;
    }
  }, [firebaseUser, wishlistId]);

  const isOwner = useMemo(
    () => !!firebaseUser && wishlist?.userId === firebaseUser.uid,
    [firebaseUser, wishlist]
  );
  const isOtherUser = useMemo(
    () => !!firebaseUser && wishlist?.userId !== firebaseUser.uid,
    [firebaseUser, wishlist]
  );
  const currentUserId = firebaseUser?.uid;

  return {
    wishlist,
    items,
    setItems,
    error,
    isOwner,
    isOtherUser,
    currentUserId,
    persistItemOrder,
    toggleReservation,
    handleItemAdded,
    handleItemUpdated,
    handleWishlistRenamed,
    deleteItem,
    deleteWishlist,
  };
}
