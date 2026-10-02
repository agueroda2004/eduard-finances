import { Pencil, Trash2, Wallet } from "lucide-react";
import { Button } from "../../../components/Button";
import {
  ACCOUNT_ICONS,
  type AccountIcon,
} from "../../../constants/icon.constant";
import { cn } from "../../../utils/cn";
import { formatCurrency } from "../../../utils/currency";
import { formatDateLabel } from "../../../utils/date";
import type { Account } from "../../account";
import type { Category } from "../../category";
import { useSubcategory } from "../../category";
import type { Transaction } from "../types/transaction";

interface TransactionListItemProps {
  transaction: Transaction;
  account?: Account;
  category?: Category;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionListItem({
  transaction,
  account,
  category,
  onEdit,
  onDelete,
}: TransactionListItemProps) {
  const { subcategories } = useSubcategory(transaction.categoryId);
  const subcategory = subcategories.find(
    (item) => item.id === transaction.subcategoryId,
  );
  const Icon = category ? (ACCOUNT_ICONS[category.icon as AccountIcon] ?? Wallet) : Wallet;
  const isIncome = transaction.type === "income";
  const title = category?.name ?? "Sin categoría";
  const subtitle = [subcategory?.name, account?.name]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
        <span
          className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface"
          style={{ backgroundColor: category?.color ?? "#94a3b8" }}
        />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {subtitle || "Sin detalles"}
        </p>
      </div>

      <div className="flex flex-col items-end">
        <p
          className={cn(
            "text-sm font-semibold",
            isIncome ? "text-success" : "text-danger",
          )}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount, account?.currency)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDateLabel(transaction.createdAt)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="size-9 shrink-0 px-0"
        aria-label="Editar transacción"
        onClick={() => onEdit(transaction)}
      >
        <Pencil className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="size-9 shrink-0 px-0"
        aria-label="Eliminar transacción"
        onClick={() => onDelete(transaction)}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
