import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import Card from "../components/ui/Card";
import { apiFetch } from "../api";
import toast from "react-hot-toast";
import { FiLock } from "react-icons/fi";
import Spinner from "../components/ui/Spinner";

// ✅ Define TypeScript types
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

  const toggleReservation = async (itemId: string) => {
    const token = await firebaseUser?.getIdToken();
    if (!token) {
      toast.error("You need to be logged in to reserve items.", {
        duration: 3000,
        position: "bottom-center"
      });
      return;
    }

    const response = await apiFetch(`/api/wishlist-items/${itemId}/reserve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const updatedItem = await response.json();
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
    }
  };

  if (loading) {
     return <Spinner />
  }  
  if (!wishlist) return <p className="text-gray-300 text-center mt-6">Invalid or expired shared link.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      {/* 🎁 Gifty Logo */}
      <div className="text-center mb-6">
        <h1 className="text-5xl text-purple-400 font-tually border border-purple rounded-2xl inline-block px-6 py-2">
          Gifty
        </h1>
      </div>
  
      {/* 📋 Wishlist Card (with items nested inside) */}
      <Card className="p-6 bg-gray-800">
        {/* Header: Sharer Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
          <img
            src={wishlist.ownerAvatar || "/avatars/avatar1.png"}
            alt="Sharer Avatar"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/20"
          />
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-400">{wishlist.name}</h2>
            <p className="text-gray-300 mt-1">
              Shared by:{" "}
              <span className="text-white font-medium">
                {wishlist.ownerId === firebaseUser?.uid ? "You" : wishlist.ownerName || "Unknown"}
              </span>
            </p>
          </div>
        </div>
  
        {/* 🔗 CTA Button */}
        <div className="text-center mb-6">
          <Link
            to={firebaseUser ? "/dashboard" : "/"}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition text-lg font-medium shadow-md inline-block"
          >
            {firebaseUser ? "Go to Dashboard" : "Open Gifty App"}
          </Link>
        </div>
  
        {/* 🧾 Wishlist Items */}
        {wishlist.items.length > 0 ? (
          <div className="space-y-4">
            {wishlist.items.map((item) => {
              const isReserver = item.reservedBy === firebaseUser?.uid;
              const isGuest = !firebaseUser;
              const isReserved = item.isReserved;
  
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10"
                >
                  {/* Name & Link */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      {isReserved && <FiLock className="text-red-400" title="Item reserved" />}
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm underline break-all"
                    >
                      View Item ↗
                    </a>
                  </div>
  
                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-3 sm:mt-0">
                    {isReserved ? (
                      <span
                        className={`text-sm px-3 py-1 rounded-full flex items-center gap-2 ${
                          isReserver ? "bg-green-700" : "bg-red-700"
                        }`}
                      >
                        <FiLock size={14} />
                        {isReserver ? "You reserved this" : "Reserved"}
                      </span>
                    ) : isGuest ? (
                      <span className="text-sm text-red-400 italic">Login to reserve</span>
                    ) : (
                      <button
                        onClick={() => toggleReservation(item.id)}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
                      >
                        Reserve
                      </button>
                    )}
  
                    {isReserver && (
                      <button
                        onClick={() => toggleReservation(item.id)}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
                      >
                        Unreserve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center">No items in this wishlist.</p>
        )}
      </Card>
    </div>
  );    
  
};

export default SharedWishlist;
