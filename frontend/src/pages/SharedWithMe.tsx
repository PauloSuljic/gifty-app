import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import Card from "../components/ui/Card";
import WishlistItem from "../components/WishlistItem";
import Layout from "../components/layout/Layout";
import { toast } from "react-hot-toast";
import { apiFetch } from "../api";

type SharedWishlistItem = {
  id: string;
  name: string;
  link?: string;
  isReserved: boolean;
  reservedBy?: string | null;
};

type SharedWishlist = {
  id: string;
  name: string;
  items: SharedWishlistItem[];
};

type GroupedWishlists = {
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  wishlists: SharedWishlist[];
};

const SharedWithMe = () => {
  const { firebaseUser } = useAuth();
  const [sharedWishlists, setSharedWishlists] = useState<GroupedWishlists[]>([]);
  const [expandedWishlistIds, setExpandedWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;

    const fetchSharedWishlists = async () => {
      const token = await firebaseUser.getIdToken();
      const response = await apiFetch("/api/shared-links/shared-with-me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSharedWishlists(data);
      }
    };

    fetchSharedWishlists();
  }, [firebaseUser]);

  // ✅ Function to reserve/unreserve an item (Limit 1 reservation per wishlist)
  const toggleReservation = async (wishlistId: string, itemId: string) => {
    const token = await firebaseUser?.getIdToken();
    if (!token) return;
  
    try {
      const response = await apiFetch(`/api/wishlist-items/${itemId}/reserve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
  
        // ❌ Show error toast for "only one item per wishlist"
        if (errorData.error === "You can only reserve 1 item per wishlist.") {
          toast.error("You can only reserve 1 item per wishlist.", {
            duration: 3000,
            position: "bottom-center",
            style: {
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
            },
          });
        }
        return; // ✅ Stop here if error
      }
  
      const updatedItem = await response.json();
  
      // ✅ Show toast based on action
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
  
      // ✅ Update UI immediately
      setSharedWishlists((prev) =>
        prev.map((group) => ({
          ...group,
          wishlists: group.wishlists.map((w) =>
            w.id === wishlistId
              ? {
                  ...w,
                  items: w.items.map((i) =>
                    i.id === itemId
                      ? {
                          ...i,
                          isReserved: updatedItem.isReserved,
                          reservedBy: updatedItem.reservedBy,
                        }
                      : i
                  ),
                }
              : w
          ),
        }))
      );
    } catch (error) {
      console.error("Error toggling reservation:", error);
      toast.error("Something went wrong!", {
        duration: 3000,
        position: "bottom-center",
      });
    }
  };  

  const toggleWishlistDropdown = (wishlistId: string) => {
    setExpandedWishlistIds(prev =>
      prev.includes(wishlistId)
        ? prev.filter(id => id !== wishlistId)
        : [...prev, wishlistId]
    );
  };

  return (
    <Layout>
      <h2 className="text-2xl sm:text-3xl font-semibold pt-6 text-center">Wishlists Shared With Me</h2>
      <div className="mx-auto p-4 text-white w-full max-w-4xl">
      {sharedWishlists.length === 0 ? (
        <p className="text-gray-300 text-center mt-6">No shared wishlists yet.</p>
      ) : (
        sharedWishlists.map(group => (
          <div key={group.ownerId} className="mt-6">
            <div className="flex items-center space-x-3 pb-2">
              <img
                src={group.ownerAvatar || "/avatars/avatar1.png"}
                alt={`${group.ownerName}'s avatar`}
                className="w-10 h-10 rounded-full border border-gray-600"
              />
              <h3 className="text-2xl font-semibold">{group.ownerName}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.wishlists.map(wishlist => (
                <Card key={wishlist.id}>
                  <button
                    onClick={() => toggleWishlistDropdown(wishlist.id)}
                    className="w-full flex justify-between items-center text-left text-xl font-semibold text-white"
                  >
                    {wishlist.name}
                    <span className="text-sm text-gray-400">
                      {expandedWishlistIds.includes(wishlist.id) ? "▲" : "▼"}
                    </span>
                  </button>
                
                  {expandedWishlistIds.includes(wishlist.id) && (
                    <div className="mt-4 space-y-3">
                      {wishlist.items.map(item => (
                        <WishlistItem
                          key={item.id}
                          id={item.id}
                          name={item.name}
                          link={item.link || ""}
                          isReserved={item.isReserved}
                          reservedBy={item.reservedBy}
                          wishlistOwner={group.ownerId}
                          context="shared"
                          currentUser={firebaseUser?.uid || ""}
                          onToggleReserve={() => toggleReservation(wishlist.id, item.id)}
                        />
                      ))}
                    </div>
                  )}
                </Card>              
              ))}
            </div>
          </div>
        ))
      )}
      </div>
    </Layout>
  );
};

export default SharedWithMe;
