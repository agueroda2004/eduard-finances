import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "../../../utils/cn";
import type { AppNotification, ToastType } from "../types/notification";

const TOAST_STYLES: Record<
  ToastType,
  { icon: typeof Info; iconClass: string; accentClass: string }
> = {
  info: { icon: Info, iconClass: "text-info", accentClass: "border-l-info" },
  success: { icon: CheckCircle2, iconClass: "text-success", accentClass: "border-l-success" },
  error: { icon: AlertTriangle, iconClass: "text-danger", accentClass: "border-l-danger" },
};

interface ToastItemProps {
  toast: AppNotification;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { icon: Icon, iconClass, accentClass } = TOAST_STYLES[toast.type];

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border border-l-4 border-border bg-surface p-3 shadow-lg",
        accentClass,
        toast.leaving ? "toast-leaving" : "animate-toast-in",
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", iconClass)} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description ? (
          <p className="text-xs text-muted-foreground">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificación"
        className="-m-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

interface ToastViewportProps {
  toasts: AppNotification[];
  onDismiss: (id: string) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex flex-col items-center gap-2 p-4 sm:items-end">
      <div className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
