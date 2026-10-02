import type { ReactNode } from "react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";

interface ConfirmSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
}

export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loadingLabel = "Eliminando...",
  isLoading = false,
}: ConfirmSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      {open ? (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground">{description}</div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              {cancelLabel}
            </Button>
            <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? loadingLabel : confirmLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </BottomSheet>
  );
}
