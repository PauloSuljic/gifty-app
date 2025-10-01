import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { apiFetch } from "../api";
import Spinner from "../components/ui/Spinner";
import WishlistItem from "../components/WishlistItem";
import Layout from "../components/layout/Layout";
import UserHeader from "../components/UserHeader";

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
  ownerBio?: string;
  coverImage?: string;
};

const SharedWishlist = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [wishlist, setWishlist] = useState<WishlistType | null>(null);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();

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

  // Disabled reservation actions for read-only presentation

  if (loading) return <Spinner />;
  if (!wishlist) {
    return (
      <p className="text-gray-300 text-center mt-6">
        Invalid or expired shared link.
      </p>
    );
  }

  if (firebaseUser) {
    navigate(`/wishlist/${wishlist.id}`);
    return null;
  }

  return (
    <Layout hideHeader guest>
      <UserHeader
        avatarUrl={wishlist.ownerAvatar}
        username={wishlist.ownerName}
        bio={wishlist.ownerBio || ""}
      />
      <div className="px-4 py-3 text-center">
        <h2 className="text-lg font-semibold">{wishlist.name}</h2>
        <p className="text-sm text-gray-400">{wishlist.items.length} items</p>
      </div>

      {/* Cover */}
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
      </div>

      {/* Items */}
      <div className="px-4 mt-6 space-y-3">
        {wishlist.items.length > 0 ? (
          wishlist.items.map((item) => (
            <WishlistItem
              key={item.id}
              id={item.id}
              name={item.name}
              link={item.link}
              isReserved={item.isReserved}
              reservedBy={item.reservedBy}
              wishlistOwner={wishlist.ownerId}
              currentUser={firebaseUser ? (firebaseUser as any).uid : undefined}
              context="guest"
            />
          ))
        ) : (
          <p className="text-gray-400 text-center">
            No items in this wishlist.
          </p>
        )}
      </div>
    </Layout>
  );
};

export default SharedWishlist;
