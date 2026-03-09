import { useEffect, useState } from "react";
import { FiBell, FiGift, FiUser, FiX, FiCalendar, FiLock, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useNotificationContext } from "../../../context/useNotificationContext";
import { useNavigate } from "react-router-dom";
import type { NotificationItem } from "../../../context/NotificationContextCore";
import { useUpcomingBirthdays } from "../../../hooks/useUpcomingBirthdays";

export default function NotificationsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { notifications } = useNotificationContext();
  const navigate = useNavigate();
  const [isBirthdaysExpanded, setIsBirthdaysExpanded] = useState(true);
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : false
  );
  const { birthdays: upcomingBirthdays, loading: birthdaysLoading } = useUpcomingBirthdays(
    5,
    isOpen && isDesktopViewport
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewport = (event: MediaQueryListEvent) => {
      setIsDesktopViewport(event.matches);
    };

    setIsDesktopViewport(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  if (!isOpen) return null;

  const recentNotifications = notifications
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const onCloseModal = () => {
    onClose();
  };

  const handleViewAll = () => {
    onCloseModal();
    navigate("/notifications");
  };

  const iconOf = (type: NotificationItem["type"]) => {
    switch (type) {
      case "BirthdayReminder":
      case "ItemReserved":
        return <FiLock className="text-purple-400 shrink-0" size={18} />;
      case "WishlistShared":
        return <FiUser className="text-purple-400 shrink-0" size={18} />;
      default:
        return <FiBell className="text-purple-400 shrink-0" size={18} />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onCloseModal} />

      <div
        id="desktop-notifications-panel"
        className="fixed right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-[90%] sm:w-96 mx-auto max-h-[80vh] overflow-y-auto z-50 p-6 flex flex-col lg:right-8 lg:top-20 lg:translate-x-0 lg:translate-y-0 lg:w-[420px] lg:max-h-[calc(100vh-8rem)] lg:border-gray-700/80 lg:bg-[#0f1c35]"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <FiBell className="text-purple-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-100">
              Notifications
            </h2>
          </div>
          <button
            onClick={onCloseModal}
            className="text-gray-400 hover:text-gray-200"
            aria-label="Close notifications"
          >
            <FiX size={24} />
          </button>
        </div>

        {recentNotifications.length === 0 ? (
          <p className="text-sm text-gray-400 leading-relaxed px-1 py-3">
            You&apos;re all caught up.
          </p>
        ) : (
          <ul className="flex flex-col space-y-3">
            {recentNotifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start p-4 rounded-xl border ${
                  n.isRead
                    ? "bg-gray-800/70 border-gray-700"
                    : "bg-gray-700/70 border-purple-500/40"
                }`}
              >
                {iconOf(n.type)}
                <div className="ml-3 min-w-0">
                  {n.title && (
                    <p className="text-purple-300 text-xs font-semibold leading-tight">
                      {n.title}
                    </p>
                  )}
                  <p className="text-gray-200/90 text-sm leading-snug mt-1">
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleViewAll}
          className="w-full rounded-lg border border-gray-600 hover:bg-gray-700/50 text-purple-400 text-sm font-medium text-center py-2.5 mt-4"
        >
          View All Notifications
        </button>

        <div className="hidden lg:block h-px bg-gray-700/60 my-5" />

        <section className="hidden lg:block">
          <button
            onClick={() => setIsBirthdaysExpanded((prev) => !prev)}
            className="w-full flex items-center justify-between text-left mb-3"
            aria-expanded={isBirthdaysExpanded}
            aria-controls="upcoming-birthdays-panel"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-200">
              <FiCalendar className="text-purple-400" size={18} />
              Upcoming birthdays
            </span>
            {isBirthdaysExpanded ? (
              <FiChevronUp className="text-gray-400" size={18} />
            ) : (
              <FiChevronDown className="text-gray-400" size={18} />
            )}
          </button>

          {isBirthdaysExpanded && (
            <div id="upcoming-birthdays-panel">
              {birthdaysLoading && (
                <ul className="flex flex-col gap-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <li key={i} className="p-3 rounded-xl border border-gray-700 bg-gray-800/60">
                      <div className="h-3 w-28 bg-gray-700 rounded mb-2" />
                      <div className="h-2 w-36 bg-gray-700 rounded" />
                    </li>
                  ))}
                </ul>
              )}

              {!birthdaysLoading && upcomingBirthdays.length === 0 && (
                <p className="text-sm text-gray-400 leading-relaxed px-1 py-2">
                  No upcoming birthdays right now.
                </p>
              )}

              {!birthdaysLoading && upcomingBirthdays.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {upcomingBirthdays.map((birthday) => (
                    <li key={birthday.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onCloseModal();
                          navigate("/shared-with-me", {
                            state: { highlightUserId: birthday.id },
                          });
                        }}
                        className="flex w-full items-start gap-3 p-3 rounded-xl border border-gray-700 bg-gray-800/60 cursor-pointer hover:bg-gray-700/60 transition-colors text-left"
                      >
                        <FiGift size={16} className="text-purple-400 mt-1 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-100 truncate">
                            {birthday.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Birthday in {birthday.daysLeft} days
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
