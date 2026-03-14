import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiCalendar,
  FiGift,
  FiMoreVertical,
  FiSearch,
  FiUserPlus,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ConfirmRemoveSharedModal from "../components/ui/modals/ConfirmRemoveSharedModal";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { calculateDaysUntilBirthday } from "../shared/lib/birthdays";
import { formatDateOnly } from "../shared/lib/dateOnly";
import { getWishlistCoverImage } from "../shared/lib/getWishlistCoverImage";
import {
  getSharedOwnerName,
  getSharedWithMe,
  removeSharedWithMe,
  type SharedWithMeGroup,
} from "../shared/lib/sharedLinks";

const fallbackCoverImage =
  "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0";
const friendShellClass = "bg-[#2c3048]";
const insightsClass = "bg-[#181c31]";
const wishlistSectionClass = "bg-[#2a2d45]";
const wishlistRowClass = "bg-[#171a2b]";

const formatBirthday = (dateOfBirth: string | null | undefined) => {
  if (!dateOfBirth) {
    return "Birthday not added";
  }

  return (
    formatDateOnly(dateOfBirth, {
      month: "short",
      day: "numeric",
    }) ?? "Birthday not added"
  );
};

type FriendStatProps = {
  icon: React.ReactNode;
  value: string | number;
  label: string;
};

const FriendStat = ({ icon, value, label }: FriendStatProps) => (
  <div className={`rounded-xl px-4 py-4 text-center ${insightsClass}`}>
    <div className="flex items-center justify-center gap-1.5 text-purple-300">
      <span className="shrink-0">{icon}</span>
      <span className="text-[1.5rem] font-bold leading-none text-white sm:text-[1.75rem]">
        {value}
      </span>
    </div>
    <p className="mt-2 text-sm text-gray-400">{label}</p>
  </div>
);

const FriendsPage = () => {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const highlightUserId = (location.state as { highlightUserId?: string } | null)?.highlightUserId;

  const [sharedWishlists, setSharedWishlists] = useState<SharedWithMeGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [removeModalOwnerId, setRemoveModalOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setSharedWishlists([]);
      setExpandedGroups([]);
      setIsLoading(false);
      return;
    }

    const fetchSharedWishlists = async () => {
      setIsLoading(true);

      try {
        const token = await firebaseUser.getIdToken();
        const data = await getSharedWithMe(token);
        const sortedData = [...data];

        if (highlightUserId) {
          sortedData.sort((a, b) =>
            a.ownerId === highlightUserId ? -1 : b.ownerId === highlightUserId ? 1 : 0
          );
          setExpandedGroups((prev) =>
            prev.includes(highlightUserId) ? prev : [...prev, highlightUserId]
          );
        }

        setSharedWishlists(sortedData);
      } catch (error) {
        console.error("Failed to fetch friends data:", error);
        setSharedWishlists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedWishlists();
  }, [firebaseUser, highlightUserId]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredGroups = sharedWishlists.filter((group) => {
    if (!normalizedQuery) {
      return true;
    }

    const ownerName = getSharedOwnerName(group.ownerName);
    const matchesOwner = ownerName.toLowerCase().includes(normalizedQuery);
    const matchesWishlist = group.wishlists.some((wishlist) =>
      wishlist.name.toLowerCase().includes(normalizedQuery)
    );

    return matchesOwner || matchesWishlist;
  });

  const toggleGroup = (ownerId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(ownerId) ? prev.filter((id) => id !== ownerId) : [...prev, ownerId]
    );
  };

  return (
    <>
      <div className="space-y-8 pb-6 text-white">
        <section>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Friends</h1>

            <button
              type="button"
              onClick={() => toast("Friend invitations are not part of this phase yet.")}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-[#6d70f6] to-[#9b82f6] px-3.5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#6366f1]/20 sm:px-4"
            >
              <FiUserPlus size={16} />
              <span>Add Friend</span>
            </button>
          </div>
          <p className="mt-3 text-lg text-gray-400">
            Connect and share wishlists with friends
          </p>
        </section>

        <section className="mb-5">
          <label htmlFor="friends-search" className="sr-only">
            Search friends
          </label>
          <div
            className={`flex h-[3.25rem] items-center gap-3 overflow-hidden bg-gray-800/70 rounded-2xl px-4 text-gray-400 transition focus-within:ring-1 focus-within:ring-[#6366f1]/30 ${friendShellClass}`}
          >
            <FiSearch size={18} className="shrink-0" />
            <input
              id="friends-search"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search friends..."
              className="h-full w-full appearance-none border-0 bg-transparent text-[0.95rem] text-white outline-none ring-0 placeholder:text-gray-400 focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
            />
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-[2rem] bg-[#232743] p-8 shadow-lg">
            <Spinner />
          </div>
        ) : filteredGroups.length > 0 ? (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
            {filteredGroups.map((group) => {
              const isExpanded = expandedGroups.includes(group.ownerId);
              const visibleWishlists = isExpanded ? group.wishlists : group.wishlists.slice(0, 2);
              const totalGroupItems = group.wishlists.reduce(
                (sum, wishlist) => sum + wishlist.items.length,
                0
              );
              const daysLeft =
                group.ownerDateOfBirth != null
                  ? calculateDaysUntilBirthday(group.ownerDateOfBirth)
                  : null;
              const birthdayLabel = formatBirthday(group.ownerDateOfBirth);
              const isHighlighted = group.ownerId === highlightUserId;
              const ownerName = getSharedOwnerName(group.ownerName);

              return (
                <article
                  key={group.ownerId}
                  className={`min-w-0 overflow-hidden bg-gray-800 rounded-2xl shadow-lg ${friendShellClass} ${
                    isHighlighted ? "ring-1 ring-[#6366f1]/45" : ""
                  }`}
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-4">
                        <img
                          src={group.ownerAvatar || "/avatars/avatar1.png"}
                          alt={`${ownerName}'s avatar`}
                          className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a78bfa] object-cover"
                        />
                        <div className="min-w-0">
                          <h2 className="truncate text-[1.35rem] font-semibold leading-none text-white">
                            {ownerName}
                          </h2>
                          <p className="mt-1 text-sm text-gray-300">
                            {group.wishlists.length}{" "}
                            {group.wishlists.length === 1 ? "shared wishlist" : "shared wishlists"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setRemoveModalOwnerId(group.ownerId)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-gray-400 transition hover:bg-white/5 hover:text-red-300"
                        aria-label={`Remove ${ownerName}'s shared wishlists`}
                      >
                        <FiMoreVertical size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FriendStat
                        icon={<FiGift size={16} />}
                        value={group.wishlists.length}
                        label="Lists"
                      />
                      <FriendStat
                        icon={<FiArrowRight size={16} />}
                        value={totalGroupItems}
                        label="Items"
                      />
                      <FriendStat
                        icon={<FiCalendar size={16} />}
                        value={daysLeft ?? "--"}
                        label={daysLeft != null ? "days" : "No date"}
                      />
                    </div>

                    <div className="mt-4 rounded-xl border border-[#5f66d4] bg-gradient-to-r from-[#4b4f84] via-[#56598e] to-[#61629a] px-4 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <p className="text-base font-semibold text-[#b392ff]">
                        {birthdayLabel === "Birthday not added"
                          ? birthdayLabel
                          : `Birthday: ${birthdayLabel}`}
                      </p>
                    </div>
                  </div>

                  <div className={`border-t bg-gray-800 border-white/5 p-6 ${wishlistSectionClass}`}>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-400">
                      Wishlists ({group.wishlists.length})
                    </p>

                    <div id={`friend-wishlists-${group.ownerId}`} className="mt-5 space-y-3">
                      {visibleWishlists.map((wishlist) => {
                        const coverImage = getWishlistCoverImage({
                          items: wishlist.items,
                          fallbackImage: fallbackCoverImage,
                          wishlistCoverImage: wishlist.coverImage,
                        });

                        return (
                          <button
                            key={wishlist.id}
                            type="button"
                            onClick={() => navigate(`/wishlist/${wishlist.id}`)}
                            className={`flex w-full items-center gap-4 rounded-xl p-4 text-left transition hover:bg-[#1f2338] ${wishlistRowClass}`}
                          >
                            <img
                              src={coverImage}
                              alt={wishlist.name}
                              className="h-10 w-10 shrink-0 rounded-lg bg-[#2a2d3e] object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xl font-semibold text-white">
                                {wishlist.name}
                              </p>
                              <p className="mt-1 text-sm text-gray-400">
                                {wishlist.items.length}{" "}
                                {wishlist.items.length === 1 ? "item" : "items"}
                              </p>
                            </div>
                            <FiArrowRight className="shrink-0 text-gray-500" size={20} />
                          </button>
                        );
                      })}
                    </div>

                    {group.wishlists.length > 2 && (
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.ownerId)}
                        className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-[#1f2338] hover:text-white ${wishlistRowClass}`}
                        aria-expanded={isExpanded}
                        aria-controls={`friend-wishlists-${group.ownerId}`}
                      >
                        {isExpanded
                          ? "Show fewer wishlists"
                          : `Show ${group.wishlists.length - visibleWishlists.length} more`}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="rounded-[2rem] bg-[#232743] p-8 text-center shadow-lg">
            <h2 className="text-2xl font-semibold text-white">
              {sharedWishlists.length === 0 ? "No friends yet" : "No matches found"}
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              {sharedWishlists.length === 0
                ? "Once someone shares a wishlist with you, they will appear here."
                : "Try a different search term for a friend name or wishlist title."}
            </p>
          </section>
        )}
      </div>

      <ConfirmRemoveSharedModal
        isOpen={removeModalOwnerId !== null}
        onClose={() => setRemoveModalOwnerId(null)}
        onConfirm={async () => {
          if (!removeModalOwnerId || !firebaseUser) {
            return;
          }

          try {
            const token = await firebaseUser.getIdToken();
            await removeSharedWithMe(removeModalOwnerId, token);
            setSharedWishlists((prev) => prev.filter((group) => group.ownerId !== removeModalOwnerId));
            setExpandedGroups((prev) => prev.filter((id) => id !== removeModalOwnerId));
            setRemoveModalOwnerId(null);
            toast.success("Removed shared wishlists");
          } catch (error) {
            console.error("Failed to remove shared wishlists:", error);
            toast.error("Failed to remove shared wishlists");
          }
        }}
        ownerName={getSharedOwnerName(
          sharedWishlists.find((group) => group.ownerId === removeModalOwnerId)?.ownerName
        )}
      />
    </>
  );
};

export default FriendsPage;
