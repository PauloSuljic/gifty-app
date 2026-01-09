import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from "react";
import { apiFetch } from "../api";
import { useAuth } from "../hooks/useAuth";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;   // ✅ NEW
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = useCallback(async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      const res = await apiFetch("/api/notifications", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      const sorted = data.sort(
        (a: NotificationItem, b: NotificationItem) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(sorted);
    } catch (err) {
      console.error("Failed loading notifications", err);
    }
  }, [firebaseUser]);

  // ✅ Safe wrapper – same as loadNotifications but semantic name
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  const markAllAsRead = async () => {
    if (!firebaseUser) return;

    try {
      const token = await firebaseUser.getIdToken();
      await apiFetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
  };

  // 🔄 Refresh notifications when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (firebaseUser) refreshNotifications();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [firebaseUser, refreshNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loadNotifications,
        refreshNotifications,  // ✅ Added
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotificationContext must be used inside provider");
  return ctx;
}
