import { Pencil, Trash2, Wallet } from "lucide-react";
import { Button } from "../../../components/Button";
import {
  ACCOUNT_ICONS,
  type AccountIcon,
} from "../../../constants/icon.constant";
import { formatCurrency } from "../../../utils/currency";
import type { Account } from "../types/account";
import { ACCOUNT_TYPE_LABELS } from "../types/account.constants";

interface AccountListItemProps {
  account: Account;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
}

export function AccountListItem({
  account,
  onEdit,
  onDelete,
}: AccountListItemProps) {
  const Icon = ACCOUNT_ICONS[account.icon as AccountIcon] ?? Wallet;

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
        <span
          className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface"
          style={{ backgroundColor: account.color }}
        />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium text-foreground">{account.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {ACCOUNT_TYPE_LABELS[account.type]}
        </p>
      </div>

      <div className="flex flex-col items-end">
        <p className="text-sm font-semibold text-foreground">
          {account.balance === null
            ? "—"
            : formatCurrency(account.balance, account.currency)}
        </p>
        {account.active ? null : (
          <span className="text-xs text-muted-foreground">Inactiva</span>
        )}
      </div>

      {onEdit ? (
        <Button
          variant="ghost"
          size="sm"
          className="size-9 shrink-0 px-0"
          aria-label="Editar cuenta"
          onClick={() => onEdit(account)}
        >
          <Pencil className="size-4" />
        </Button>
      ) : null}

      {onDelete ? (
        <Button
          variant="ghost"
          size="sm"
          className="size-9 shrink-0 px-0"
          aria-label="Eliminar cuenta"
          onClick={() => onDelete(account)}
        >
          <Trash2 className="size-4" />
        </Button>
      ) : null}
    </li>
  );
}
