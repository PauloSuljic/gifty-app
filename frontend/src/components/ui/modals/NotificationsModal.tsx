import { FiBell, FiGift, FiUser, FiX } from "react-icons/fi";
import { useNotificationContext } from "../../../context/useNotificationContext";
import { useNavigate } from "react-router-dom";

export default function NotificationsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { notifications, markAllAsRead } = useNotificationContext();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // 🔥 SHOW ONLY THE 5 MOST RECENT NOTIFICATIONS
  const recentNotifications = notifications.slice(0, 5);

  const onCloseModal = () => {
    onClose();
    markAllAsRead();
  };

  const handleViewAll = () => {
    onCloseModal();
    navigate("/notifications");
  };

  const iconOf = (type: string) => {
    switch (type) {
      case "BirthdayReminder":
      case "ItemReserved":
        return <FiGift className="text-purple-400" size={18} />;
      case "WishlistShared":
        return <FiUser className="text-purple-400" size={18} />;
      default:
        return <FiBell className="text-purple-400" size={18} />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onCloseModal} />

      <div className="fixed right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-[90%] sm:w-96 mx-auto max-h-[80vh] overflow-y-auto z-50 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FiBell className="text-purple-500" size={20} />
            <h2 className="text-large font-semibold text-gray-100">
              Notifications
            </h2>
          </div>
          <button
            onClick={onCloseModal}
            className="text-gray-400 hover:text-gray-200"
          >
            <FiX size={24} />
          </button>
        </div>

        <ul className="flex flex-col space-y-3">
          {recentNotifications.map((n: any) => (
            <li
              key={n.id}
              className={`flex items-start justify-between p-4 rounded-lg ${
                n.isRead ? "bg-gray-800" : "bg-gray-700"
              }`}
            >
              <div className="flex items-start space-x-3">
                {iconOf(n.type)}
                <div>
                  <p className="text-purple-300 text-xs">{n.title}</p>
                  <p className="text-gray-400 text-xs">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={handleViewAll}
          className="w-full rounded border border-gray-600 hover:bg-gray-700/50 text-purple-400 text-sm font-medium text-center py-2 mt-4"
        >
          View All Notifications
        </button>
      </div>
    </>
  );
}
