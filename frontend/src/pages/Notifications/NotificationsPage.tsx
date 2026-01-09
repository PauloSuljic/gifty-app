import { useEffect, useState, useRef, useCallback } from "react";
import { FiBell, FiGift, FiUser } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../api";
import { useNotificationContext } from "../../context/NotificationContext";
import Spinner from "../../components/ui/Spinner";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const { firebaseUser } = useAuth();
  const { markAllAsRead } = useNotificationContext();

  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // ----------------------------------------------------------------------
  // ✓ LOAD ALL NOTIFICATIONS -- THIS REPLACES loadAll()
  // ----------------------------------------------------------------------
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = firebaseUser ? await firebaseUser.getIdToken() : "";

      const res = await apiFetch("/api/notifications", {
        method: "GET",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();

      const sorted = data.sort(
        (a: NotificationItem, b: NotificationItem) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAllNotifications(sorted);
    } catch (err) {
      console.error("Error loading notifications", err);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  // ----------------------------------------------------------------------
  // ✓ LOAD & MARK READ ONCE WHEN PAGE OPENS
  // ----------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      await loadNotifications();
      await markAllAsRead();
    })();
  }, []);

  // ----------------------------------------------------------------------
  // ✓ INFINITE SCROLL
  // ----------------------------------------------------------------------
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) {
      setVisibleCount((prev) => prev + PAGE_SIZE);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    });

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [handleObserver]);

  const visibleItems = allNotifications.slice(0, visibleCount);

  const iconFor = (type: string) => {
    switch (type) {
      case "BirthdayReminder":
      case "ItemReserved":
        return <FiGift className="text-purple-400" size={20} />;
      case "WishlistShared":
        return <FiUser className="text-purple-400" size={20} />;
      default:
        return <FiBell className="text-purple-400" size={20} />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6">

      {/* Centered Title (no bell icon) */}
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-xl font-semibold text-gray-100">
          All Notifications
        </h1>
      </div>

      {loading && allNotifications.length === 0 ? (
        <div className="relative h-[30vh]">
          <Spinner />
        </div>
      ) : allNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] text-gray-400">
          <p className="font-medium text-gray-300">No notifications yet</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {visibleItems.map((n) => (
            <li
              key={n.id}
              className="p-4 rounded-lg border border-gray-700 bg-gray-900 flex gap-3"
            >
              <div className="pt-1">{iconFor(n.type)}</div>
              <div className="flex-1">
                <h3 className="text-purple-300 text-sm font-medium">{n.title}</h3>
                <p className="text-gray-300 text-sm">{n.message}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {allNotifications.length > 0 && (
        <div ref={loaderRef} className="py-6 text-center text-gray-500">
          {visibleCount < allNotifications.length ? "Loading more..." : "End of list"}
        </div>
      )}
    </div>
  );
}
