import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../context/useNotificationContext";
import { FiGift, FiBell, FiUser, FiCalendar, FiLock } from "react-icons/fi";
import { useUpcomingBirthdays } from "../hooks/useUpcomingBirthdays";

export default function RightSidebar() {
  const navigate = useNavigate();
  const { notifications } = useNotificationContext();

  const recentNotifications = notifications
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const { birthdays: upcomingBirthdays, loading: birthdaysLoading } =
    useUpcomingBirthdays(3);

  const renderIcon = (type?: string) => {
    switch (type) {
      case "ItemReserved":
      case "BirthdayReminder":
        return <FiLock size={16} className="text-purple-400 shrink-0" />;
      case "WishlistShared":
        return <FiUser size={16} className="text-purple-400" />;
      default:
        return <FiBell size={16} className="text-purple-400" />;
    }
  };

  return (
    <aside className="w-80 hidden lg:flex flex-col bg-gray-900 p-5 rounded-xl shadow-lg mr-4 mt-6 sticky top-6 h-fit">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
        <FiBell className="text-purple-400" size={20} />
        Notifications
      </h3>

      {recentNotifications.length === 0 ? (
        <p className="text-sm text-gray-500 leading-relaxed">
          You’re all caught up ✨
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {recentNotifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-lg ${
                n.isRead ? "bg-gray-800" : "bg-gray-700"
              }`}
            >
              {renderIcon(n.type)}

              <div className="flex flex-col gap-0.5">
                {n.title && (
                  <p className="text-purple-300 text-xs font-semibold leading-tight">
                    {n.title}
                  </p>
                )}
                <p className="text-gray-300 text-xs leading-snug">
                  {n.message}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => navigate("/notifications")}
        className="mt-5 text-sm font-medium text-indigo-400 hover:text-indigo-300 self-start"
      >
        View all →
      </button>

      <div className="h-px bg-gray-800 my-4" />

      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
        <FiCalendar className="text-purple-400" size={18} />
        Upcoming birthdays
      </h3>

      {birthdaysLoading && (
        <ul className="flex flex-col gap-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <li
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-800"
            >
              <div className="w-4 h-4 rounded-full bg-gray-700 mt-1" />

              <div className="flex flex-col gap-2 flex-1">
                <div className="h-3 w-24 bg-gray-700 rounded" />
                <div className="h-2 w-32 bg-gray-700 rounded" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!birthdaysLoading && upcomingBirthdays.length === 0 && (
        <p className="text-sm text-gray-500">
          No upcoming birthdays
        </p>
      )}

      {!birthdaysLoading && upcomingBirthdays.length > 0 && (
        <ul className="flex flex-col gap-3">
          {upcomingBirthdays.map((b) => (
            <li
              key={b.id}
              onClick={() =>
                navigate("/shared-with-me", {
                  state: { highlightUserId: b.id },
                })
              }
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <FiGift size={16} className="text-purple-400 mt-2.5 shrink-0" />

              <div className="flex flex-col gap-0.5">
                <p className="text-gray-200 text-sm font-medium">
                  {b.name}
                </p>
                <p className="text-gray-400 text-xs leading-snug">
                  Birthday in {b.daysLeft} days
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
