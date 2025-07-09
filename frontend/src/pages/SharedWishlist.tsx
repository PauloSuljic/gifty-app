import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import Card from "../components/ui/Card";
import { apiFetch } from "../api";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import WishlistItem from "../components/WishlistItem";

type WishlistItemType = {
  id: string;
  name: string;
  link: string;
  isReserved: boolean;
  reservedBy?: string | null;
};

type WishlistType = {
  id: string;
  name: string;
  items: WishlistItemType[];
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
};

const SharedWishlist = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [wishlist, setWishlist] = useState<WishlistType | null>(null);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    const fetchSharedWishlist = async () => {
      setLoading(true);
      const token = await firebaseUser?.getIdToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await apiFetch(`/api/shared-links/${shareCode}`, {
          method: "GET",
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          setWishlist(data);
        } else {
          console.error("Failed to fetch shared wishlist.");
          setWishlist(null);
        }
      } catch (error) {
        console.error("Error fetching shared wishlist:", error);
        setWishlist(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedWishlist();
  }, [shareCode, firebaseUser]);

  const toggleReservation = async (wishlistId: string, itemId: string) => { 
    const token = await firebaseUser?.getIdToken();
    if (!token) {
      toast.error("You need to be logged in to reserve items.", {
        duration: 3000,
        position: "bottom-center",
      });
      return;
    }

    try {
      const response = await apiFetch(`/api/wishlists/${wishlistId}/items/${itemId}/reserve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();

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

      setWishlist((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      isReserved: updatedItem.isReserved,
                      reservedBy: updatedItem.reservedBy,
                    }
                  : item
              ),
            }
          : null
      );
    } catch (error) {
      console.error("Error toggling reservation:", error);
      toast.error("Something went wrong!", {
        duration: 3000,
        position: "bottom-center",
      });
    }
  };

  if (loading) return <Spinner />;
  if (!wishlist) {
    return (
      <p className="text-gray-300 text-center mt-6">
        Invalid or expired shared link.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      {/* 🎁 Gifty Logo */}
      <div className="text-center mb-6">
        <h1 className="text-5xl text-purple-400 font-tually border border-purple rounded-2xl inline-block px-6 py-2">
          Gifty
        </h1>
      </div>

      {/* 📋 Wishlist Card */}
      <Card className="p-6 bg-gray-800">
        {/* Sharer Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
          <img
            src={wishlist.ownerAvatar || "/avatars/avatar1.png"}
            alt="Sharer Avatar"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/20"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-400">
              {wishlist.name}
            </h2>
            <p className="text-gray-300 mt-1">
              Shared by:{" "}
              <span className="text-white font-medium">
                {wishlist.ownerId === firebaseUser?.uid
                  ? "You"
                  : wishlist.ownerName || "Unknown"}
              </span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-6">
          <Link
            to={firebaseUser ? "/dashboard" : "/"}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition text-lg font-medium shadow-md inline-block"
          >
            {firebaseUser ? "Go to Dashboard" : "Open Gifty App"}
          </Link>
        </div>

        {/* Items */}
        {wishlist.items.length > 0 ? (
          <div className="space-y-4">
            {wishlist.items.map((item) => (
              <WishlistItem
                key={item.id}
                id={item.id}
                name={item.name}
                link={item.link}
                isReserved={item.isReserved}
                reservedBy={item.reservedBy}
                wishlistOwner={wishlist.ownerId}
                currentUser={firebaseUser?.uid}
                context="shared"
                onToggleReserve={() => toggleReservation(wishlist.id, item.id)}              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center">
            No items in this wishlist.
          </p>
        )}
      </Card>
    </div>
  );
};

export default SharedWishlist;
