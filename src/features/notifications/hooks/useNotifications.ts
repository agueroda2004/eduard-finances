import { useContext } from "react";
import { NotificationsContext } from "../context/notifications-context";
import type { NotificationsContextValue } from "../types/notification";

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}
