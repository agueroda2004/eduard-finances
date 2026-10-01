import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  return createPortal(
    <div
      className={cn("fixed inset-0 z-[60]", !open && "pointer-events-none")}
      inert={!open}
    >
      <div
        className="sheet-backdrop absolute inset-0 bg-black/50"
        data-open={open}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        data-open={open}
        className="sheet-panel absolute inset-x-0 bottom-0 mx-auto flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl border-t border-border bg-surface outline-none sm:border"
      >
        <span className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" />

        <div className="flex items-center justify-between gap-2 px-4 py-3">
          {title ? (
            <h2 id={titleId} className="text-base font-semibold text-foreground">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-1 inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
