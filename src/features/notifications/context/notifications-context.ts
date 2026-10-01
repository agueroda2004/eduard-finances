import { createContext } from "react";
import type { NotificationsContextValue } from "../types/notification";

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);
