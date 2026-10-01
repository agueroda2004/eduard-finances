export type ToastType = "info" | "success" | "error";

export interface ToastOptions {
  description?: string;
  duration?: number;
}

export interface AppNotification {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  leaving?: boolean;
}

export type Notify = (title: string, options?: ToastOptions) => string;

export interface NotificationsContextValue {
  info: Notify;
  success: Notify;
  error: Notify;
  dismiss: (id: string) => void;
}
