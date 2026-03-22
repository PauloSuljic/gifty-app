import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getSharedWishlist, SharedWishlistDetails } from "../shared/lib/sharedLinks";
import Spinner from "../components/ui/Spinner";
import WishlistItem from "../components/WishlistItem";
import UserHeader from "../components/UserHeader";
import WishlistDetailSidebar from "../components/WishlistDetailSidebar";

const SharedWishlist = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [wishlist, setWishlist] = useState<SharedWishlistDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const currentUserId = firebaseUser?.uid;

  useEffect(() => {
    const fetchSharedWishlist = async () => {
      if (!shareCode) {
        setWishlist(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = await firebaseUser?.getIdToken();
        const data = await getSharedWishlist(shareCode, token);
        setWishlist(data);
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
    <div className="mx-auto max-w-7xl px-4 py-3 text-white sm:px-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="xl:col-start-1">
          <UserHeader
            avatarUrl={wishlist.ownerAvatar}
            username={wishlist.ownerName}
            bio={wishlist.ownerBio || ""}
          />
        </div>

        <header className="space-y-3 text-center xl:col-start-1 xl:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-300/80">
            Shared wishlist
          </p>
          <div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">{wishlist.name}</h1>
            <p className="mt-2 text-base text-gray-400">{wishlist.items.length} items</p>
          </div>
        </header>

        <div className="rounded-2xl overflow-hidden shadow-md bg-[#232336] border border-gray-700/70 xl:col-start-1 xl:row-start-3">
          <img
            src={
              wishlist.coverImage ||
              "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            }
            alt={wishlist.name}
            className="h-40 w-full object-cover sm:h-52 xl:h-56"
          />
        </div>

        <div className="xl:col-start-2 xl:row-start-3">
          <WishlistDetailSidebar
            noteTitle="Shared with care"
            noteBody="This desktop layout keeps the wishlist focused. Sign in when you are ready to reserve an item and keep the rest visible for everyone else."
          />
        </div>

        <section className="xl:col-start-1">
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
                currentUser={currentUserId}
                context="guest"
                description={item.description}
              />
            ))
          ) : (
            <p className="text-center text-gray-400">
              No items in this wishlist.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default SharedWishlist;
