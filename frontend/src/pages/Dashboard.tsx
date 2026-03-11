import { useEffect, useState } from "react";
import { FiArrowRight, FiCalendar, FiUsers } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../hooks/useAuth";
import { useUpcomingBirthdays } from "../hooks/useUpcomingBirthdays";
import { useWishlists } from "../hooks/useWishlists";
import { getWishlistCoverImage } from "../shared/lib/getWishlistCoverImage";
import { getSharedWithMe, type SharedWithMeGroup } from "../shared/lib/sharedLinks";

const fallbackCoverImage =
  "https://images.unsplash.com/photo-1647221598091-880219fa2c8f?q=80&w=2232&auto=format&fit=crop&ixlib=rb-4.1.0";

const calculateDaysUntilBirthday = (dateString: string) => {
  const today = new Date();
  const birthday = new Date(dateString);

  birthday.setFullYear(today.getFullYear());

  if (birthday < today) {
    birthday.setFullYear(today.getFullYear() + 1);
  }

  return Math.ceil((birthday.getTime() - today.getTime()) / 86400000);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const { wishlists, wishlistItems, isWishlistsLoading } = useWishlists();
  const { birthdays, loading: areBirthdaysLoading } = useUpcomingBirthdays(3);
  const [friendActivity, setFriendActivity] = useState<SharedWithMeGroup[]>([]);
  const [isFriendActivityLoading, setIsFriendActivityLoading] = useState(true);
  const dashboardWishlists = wishlists.slice(0, 3);

  useEffect(() => {
    if (!firebaseUser) {
      setFriendActivity([]);
      setIsFriendActivityLoading(false);
      return;
    }

    const loadFriendActivity = async () => {
      setIsFriendActivityLoading(true);

      try {
        const token = await firebaseUser.getIdToken();
        const sharedGroups = await getSharedWithMe(token);
        setFriendActivity(sharedGroups.slice(0, 3));
      } catch (error) {
        console.error("Failed to load friend activity:", error);
        setFriendActivity([]);
      } finally {
        setIsFriendActivityLoading(false);
      }
    };

    loadFriendActivity();
  }, [firebaseUser]);

  return (
    <div className="mt-6 space-y-8 text-white">
      <section className="hidden rounded-3xl border border-gray-700/70 bg-gradient-to-br from-gray-800/95 via-gray-800 to-gray-900 px-6 py-6 shadow-lg md:block">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-purple-300/80">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Keep your gifting plans moving.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-gray-300 sm:text-base">
              This dashboard is the new starting point for the app. For now it focuses on
              structure: your core wishlist area, friend activity entry points, and upcoming
              celebrations.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/my-wishlists")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-400"
            >
              Open My Wishlists
              <FiArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/shared-with-me")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-600 bg-gray-800/70 px-5 py-3 text-sm font-semibold text-gray-100 transition hover:border-gray-500 hover:bg-gray-700/80"
            >
              View Friends
              <FiUsers size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="min-w-0 overflow-hidden rounded-3xl border border-gray-700/70 bg-gray-800/80 p-5 shadow-lg">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-white">Wishlist overview</h2>
              <p className="mt-1 text-sm text-gray-400">
                A quick way back into the wishlists you are actively managing.
              </p>
            </div>
            <Link
              to="/my-wishlists"
              className="inline-flex items-center gap-2 self-start text-sm font-medium text-purple-300 transition hover:text-purple-200"
            >
              View all
              <FiArrowRight size={16} />
            </Link>
          </div>

          {isWishlistsLoading ? (
            <Spinner />
          ) : dashboardWishlists.length > 0 ? (
            <div className="w-full overflow-hidden">
              <div className="grid w-full auto-cols-[78%] grid-flow-col gap-4 overflow-x-auto pb-2 md:grid-flow-row md:auto-cols-auto md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
              {dashboardWishlists.map((wishlist) => {
                const items = wishlistItems[wishlist.id] ?? [];
                const coverImage = getWishlistCoverImage({
                  items,
                  fallbackImage: fallbackCoverImage,
                  wishlistCoverImage: wishlist.coverImage,
                });

                return (
                  <button
                    key={wishlist.id}
                    type="button"
                    onClick={() => navigate(`/wishlist/${wishlist.id}`)}
                    className="min-w-0 overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/70 text-left transition hover:-translate-y-0.5 hover:border-purple-500/40 hover:bg-gray-900"
                  >
                    <img
                      src={coverImage}
                      alt={wishlist.name}
                      className="h-32 w-full object-cover"
                    />
                    <div className="space-y-1.5 p-3">
                      <h3 className="text-base font-semibold text-white">{wishlist.name}</h3>
                      <p className="text-sm text-gray-400">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </button>
                );
              })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-600 bg-gray-900/40 p-6 text-center">
              <h3 className="text-lg font-semibold text-white">No wishlists yet</h3>
              <p className="mt-2 text-sm text-gray-400">
                Create your first wishlist to start shaping the new dashboard experience.
              </p>
              <button
                onClick={() => navigate("/my-wishlists")}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
              >
                Go to My Wishlists
                <FiArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <section className="rounded-3xl border border-gray-700/70 bg-gray-800/80 p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300">
                <FiCalendar size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Upcoming celebrations</h2>
                <p className="text-sm text-gray-400">Birthdays from people sharing wishlists with you.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {areBirthdaysLoading ? (
                <Spinner />
              ) : birthdays.length > 0 ? (
                birthdays.map((birthday) => (
                  <button
                    key={birthday.id}
                    type="button"
                    onClick={() =>
                      navigate("/shared-with-me", { state: { highlightUserId: birthday.id } })
                    }
                    className="flex w-full items-center justify-between rounded-2xl border border-gray-700 bg-gray-900/70 px-4 py-3 text-left transition hover:border-purple-500/40 hover:bg-gray-900"
                  >
                    <div>
                      <p className="font-medium text-white">{birthday.name}</p>
                      <p className="text-sm text-gray-400">
                        {birthday.daysLeft} {birthday.daysLeft === 1 ? "day" : "days"} to go
                      </p>
                    </div>
                    <FiArrowRight className="text-gray-500" size={16} />
                  </button>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-600 bg-gray-900/40 px-4 py-5 text-sm text-gray-400">
                  No upcoming birthdays to show yet.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-700/70 bg-gray-800/80 p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300">
                <FiUsers size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Friends activity</h2>
                <p className="text-sm text-gray-400">What is happening with the people sharing lists with you.</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {isFriendActivityLoading ? (
                <Spinner />
              ) : friendActivity.length > 0 ? (
                friendActivity.map((group) => {
                  const birthdayCopy = group.ownerDateOfBirth
                    ? `${calculateDaysUntilBirthday(group.ownerDateOfBirth)} days to their birthday`
                    : "No birthday added yet";

                  return (
                    <button
                      key={group.ownerId}
                      type="button"
                      onClick={() =>
                        navigate("/shared-with-me", { state: { highlightUserId: group.ownerId } })
                      }
                      className="flex w-full items-center justify-between rounded-2xl border border-gray-700 bg-gray-900/70 px-4 py-3 text-left transition hover:border-purple-500/40 hover:bg-gray-900"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-white">{group.ownerName}</p>
                        <p className="mt-1 text-sm text-gray-400">
                          {group.wishlists.length} {group.wishlists.length === 1 ? "wishlist" : "wishlists"} shared
                        </p>
                        <p className="text-xs text-gray-500">{birthdayCopy}</p>
                      </div>
                      <FiArrowRight className="shrink-0 text-gray-500" size={16} />
                    </button>
                  );
                })
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-600 bg-gray-900/40 px-4 py-5 text-sm text-gray-400">
                  No friend activity to show yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
