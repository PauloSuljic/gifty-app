import { apiClient } from "../../../shared/lib/apiClient";
import { NotificationItem } from "../../../context/NotificationContextCore";

export const notificationsQueryKey = (userId?: string) => ["notifications", userId];

export const fetchNotifications = async (token: string, signal?: AbortSignal) => {
  return apiClient.get<NotificationItem[]>("/api/notifications", { token, signal });
};

export const markAllNotificationsRead = async (token: string) => {
  await apiClient.post<void>("/api/notifications/mark-read", undefined, { token });
};
