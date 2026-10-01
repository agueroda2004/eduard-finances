import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastViewport } from "../components/Toast";
import { NotificationsContext } from "./notifications-context";
import type {
  AppNotification,
  NotificationsContextValue,
  ToastOptions,
  ToastType,
} from "../types/notification";

const DEFAULT_DURATION = 4000;
const EXIT_DURATION = 180;
const MAX_TOASTS = 4;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const timers = useRef(new Map<string, number>());
  const toastsRef = useRef<AppNotification[]>([]);

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) {
        window.clearTimeout(timer);
      }
      pending.clear();
    };
  }, []);

  const clearTimer = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((current) =>
        current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
      );
      const exitTimer = window.setTimeout(() => {
        timers.current.delete(id);
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, EXIT_DURATION);
      timers.current.set(id, exitTimer);
    },
    [clearTimer],
  );

  const push = useCallback(
    (type: ToastType, title: string, options?: ToastOptions) => {
      const id = crypto.randomUUID();
      const toast: AppNotification = {
        id,
        type,
        title,
        description: options?.description,
        duration: options?.duration,
      };

      const current = toastsRef.current;
      if (current.length >= MAX_TOASTS) {
        const excess = current.length - MAX_TOASTS + 1;
        for (const dropped of current.slice(0, excess)) {
          clearTimer(dropped.id);
        }
      }
      setToasts((previous) => [...previous, toast].slice(-MAX_TOASTS));

      const duration = options?.duration ?? (type === "error" ? 0 : DEFAULT_DURATION);
      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [clearTimer, dismiss],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      info: (title, options) => push("info", title, options),
      success: (title, options) => push("success", title, options),
      error: (title, options) => push("error", title, options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </NotificationsContext.Provider>
  );
}
