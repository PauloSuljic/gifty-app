import { FiBell } from "react-icons/fi";
import { useNotificationContext } from "../../context/NotificationContext";

export default function NotificationBell({ onClick }: { onClick: () => void }) {
  const { unreadCount } = useNotificationContext();

  return (
    <button
      onClick={onClick}
      className="p-2 bg-gray-800 rounded-lg shadow-lg text-white relative"
    >
      <FiBell size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-purple-500 text-xs text-white rounded-full px-1">
          {unreadCount}
        </span>
      )}
    </button>
  );
}