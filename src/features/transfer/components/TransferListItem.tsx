import { ArrowRight, ArrowRightLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../components/Button";
import { formatCurrency } from "../../../utils/currency";
import { formatDateLabel } from "../../../utils/date";
import type { Account } from "../../account";
import type { Transfer } from "../types/transfer";

interface TransferListItemProps {
  transfer: Transfer;
  fromAccount?: Account;
  toAccount?: Account;
  onEdit: (transfer: Transfer) => void;
  onDelete: (transfer: Transfer) => void;
}

export function TransferListItem({
  transfer,
  fromAccount,
  toAccount,
  onEdit,
  onDelete,
}: TransferListItemProps) {
  const fromName = fromAccount?.name ?? "Cuenta";
  const toName = toAccount?.name ?? "Cuenta";

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <ArrowRightLeft className="size-5" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <span className="truncate">{fromName}</span>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{toName}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {transfer.note || "Sin nota"}
        </p>
      </div>

      <div className="flex flex-col items-end">
        <p className="text-sm font-semibold text-foreground">
          {formatCurrency(transfer.amount, fromAccount?.currency)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDateLabel(transfer.date)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="size-9 shrink-0 px-0"
        aria-label="Editar transferencia"
        onClick={() => onEdit(transfer)}
      >
        <Pencil className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="size-9 shrink-0 px-0"
        aria-label="Eliminar transferencia"
        onClick={() => onDelete(transfer)}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
