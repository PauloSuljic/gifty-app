import { useContext } from "react";
import { NotificationContext } from "./NotificationContextCore";

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotificationContext must be used inside provider");
  return ctx;
}
