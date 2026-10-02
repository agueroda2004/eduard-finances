import { Wallet } from "lucide-react";
import { formatCurrency } from "../../../utils/currency";
import {
  ACCOUNT_ICONS,
  type AccountIcon,
} from "../../../constants/icon.constant";
import { useSubcategory, type Category } from "../../category";
import type { CategoryTotal } from "../types/dashboard";

interface CategoryBreakdownItemProps {
  data: CategoryTotal;
  total: number;
  category?: Category;
}

export function CategoryBreakdownItem({
  data,
  total,
  category,
}: CategoryBreakdownItemProps) {
  const { subcategories } = useSubcategory(data.categoryId, {
    includeInactive: true,
  });

  const name = category?.name ?? "Sin categoría";
  const Icon = category
    ? (ACCOUNT_ICONS[category.icon as AccountIcon] ?? Wallet)
    : Wallet;
  const color = category?.color ?? "#94a3b8";
  const percent = total > 0 ? (data.total / total) * 100 : 0;

  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="size-5" />
          <span
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface"
            style={{ backgroundColor: color }}
          />
        </span>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">
            {percent.toFixed(1)}%
          </p>
        </div>

        <p className="text-sm font-semibold text-foreground">
          {formatCurrency(data.total)}
        </p>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>

      {data.subcategories.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {data.subcategories.map((subcategory) => {
            const subcategoryName = subcategory.subcategoryId
              ? (subcategories.find(
                  (item) => item.id === subcategory.subcategoryId,
                )?.name ?? "—")
              : "Sin subcategoría";
            const subcategoryPercent =
              data.total > 0 ? (subcategory.total / data.total) * 100 : 0;

            return (
              <li
                key={subcategory.subcategoryId ?? "none"}
                className="flex items-center gap-3"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {subcategoryName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {subcategoryPercent.toFixed(0)}%
                </span>
                <span className="text-xs font-medium text-foreground">
                  {formatCurrency(subcategory.total)}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}
