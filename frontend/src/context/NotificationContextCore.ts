import { createContext } from "react";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);
