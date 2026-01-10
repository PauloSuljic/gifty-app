import { useCallback, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { NotificationContext, NotificationItem } from "./NotificationContextCore";
import {
  fetchNotifications,
  markAllNotificationsRead,
  notificationsQueryKey,
} from "../features/notifications/api/notificationsApi";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { firebaseUser } = useAuth();
  const userId = firebaseUser?.uid;
  const queryClient = useQueryClient();
  const queryKey = notificationsQueryKey(userId);

  const { data = [], refetch, isLoading } = useQuery<NotificationItem[]>({
    queryKey,
    enabled: !!firebaseUser,
    queryFn: async ({ signal }) => {
      if (!firebaseUser) return [];
      try {
        const token = await firebaseUser.getIdToken();
        return await fetchNotifications(token, signal);
      } catch (error) {
        console.error("Failed loading notifications", error);
        throw error;
      }
    },
    select: (items) =>
      [...items].sort(
        (a: NotificationItem, b: NotificationItem) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
  });

  const notifications = firebaseUser ? data : [];

  // ✅ Safe wrapper – same as loadNotifications but semantic name
  const refreshNotifications = useCallback(async () => {
    if (!firebaseUser) return;
    await refetch();
  }, [firebaseUser, refetch]);

  const loadNotifications = refreshNotifications;

  const markAllMutation = useMutation({
    mutationFn: async () => {
      if (!firebaseUser) return;
      const token = await firebaseUser.getIdToken();
      await markAllNotificationsRead(token);
    },
    onMutate: async () => {
      if (!firebaseUser) return undefined;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationItem[]>(queryKey);
      queryClient.setQueryData<NotificationItem[]>(queryKey, (current = []) =>
        current.map((notification) => ({ ...notification, isRead: true }))
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      console.error("Failed to mark as read:", error);
    },
    onSettled: () => {
      if (firebaseUser) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  const markAllAsRead = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      await markAllMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }, [firebaseUser, markAllMutation]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isLoading,
        unreadCount,
        loadNotifications,
        refreshNotifications,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
