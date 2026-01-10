import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import {
  getSharedWithMe,
  removeSharedWithMe,
  SharedWithMeGroup,
  SharedWithMeWishlistItem,
} from "../shared/lib/sharedLinks";
import { FiTrash2 } from "react-icons/fi";
import ConfirmRemoveSharedModal from "../components/ui/modals/ConfirmRemoveSharedModal";


const calculateDaysUntilBirthday = (dateOfBirth: string) => {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;

  const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(today.getFullYear() + 1);
  }
  const diffTime = thisYearBirthday.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const SharedWithMe = () => {
  const { firebaseUser } = useAuth();
  const [sharedWishlists, setSharedWishlists] = useState<SharedWithMeGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [removeModalOwnerId, setRemoveModalOwnerId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const highlightUserId = location.state?.highlightUserId;

  const toggleGroup = (ownerId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(ownerId)
        ? prev.filter((id) => id !== ownerId)
        : [...prev, ownerId]
    );
  };

  useEffect(() => {
    if (!firebaseUser) return;

    const fetchSharedWishlists = async () => {
      const token = await firebaseUser.getIdToken();
      try {
        const data = await getSharedWithMe(token);

        // ✅ Move the highlighted user to the top
        if (highlightUserId) {
          data.sort((a: any, b: any) =>
            a.ownerId === highlightUserId ? -1 : b.ownerId === highlightUserId ? 1 : 0
          );
        }

        setSharedWishlists(data);
      } catch (error) {
        console.error("Failed to fetch shared wishlists:", error);
      }
    };

    fetchSharedWishlists();
  }, [firebaseUser, highlightUserId]);

  return (
    <>
      <h2 className="text-xl sm:text-3xl font-semibold pt-6 text-center">Wishlists Shared With Me</h2>
      <div className="mx-auto p-4 text-white w-full max-w-4xl">
      {sharedWishlists.length === 0 ? (
        <p className="text-gray-300 text-center mt-6">No shared wishlists yet.</p>
      ) : (
        sharedWishlists.map(group => (
          <div key={group.ownerId} className="bg-gray-800 rounded-xl p-4 mb-6">
            <div className="relative mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={group.ownerAvatar || "/avatars/avatar1.png"}
                  alt={`${group.ownerName}'s avatar`}
                  className="w-10 h-10 rounded-full border border-gray-600"
                />
                <div>
                  <h3 className="font-medium">{group.ownerName}</h3>
                  {group.ownerDateOfBirth ? (
                    <p className="text-xs text-gray-400">
                      {calculateDaysUntilBirthday(group.ownerDateOfBirth)} days until birthday
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400">No birthday set</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setRemoveModalOwnerId(group.ownerId)}
                className="absolute top-0 right-0 p-2 text-red-400 hover:text-red-500"
                aria-label="Remove"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>

            {(expandedGroups.includes(group.ownerId) ? group.wishlists : group.wishlists.slice(0, 1)).map(wl => {
              const highestOrderedItemWithImage = wl.items.reduce<SharedWithMeWishlistItem | null>(
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
                highestOrderedItemWithImage?.imageUrl ||
                wl.coverImage ||
                "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop";

              return (
                <div
                  key={wl.id}
                  className="bg-gray-700/20 rounded-lg flex justify-between items-center p-3 mb-2 cursor-pointer hover:bg-gray-700"
                  onClick={() => navigate(`/wishlist/${wl.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={coverImageUrl}
                      alt={wl.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">{wl.name}</p>
                      <p className="text-xs text-gray-400">
                        {wl.items.length} items · Updated 2 days ago
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {group.wishlists.length > 1 && (
              <button
                className="w-full text-center text-sm text-gray-400 hover:text-gray-200 mt-1"
                onClick={() => toggleGroup(group.ownerId)}
              >
                {expandedGroups.includes(group.ownerId)
                  ? "Show less"
                  : `Show ${group.wishlists.length - 1} more`}
              </button>
            )}
          </div>
        ))
      )}
      </div>
      <ConfirmRemoveSharedModal
        isOpen={!!removeModalOwnerId}
        onClose={() => setRemoveModalOwnerId(null)}
        onConfirm={async () => {
          if (!removeModalOwnerId) return;
          const token = await firebaseUser?.getIdToken();
          if (!token) return;
          try {
            await removeSharedWithMe(removeModalOwnerId, token);
            setSharedWishlists(prev => prev.filter(g => g.ownerId !== removeModalOwnerId));
            toast.success("Removed shared wishlists");
          } catch {
            toast.error("Failed to remove shared wishlists");
          }
        }}
        ownerName={sharedWishlists.find(g => g.ownerId === removeModalOwnerId)?.ownerName || ""}
      />
    </>
  );
};

export default SharedWithMe;
