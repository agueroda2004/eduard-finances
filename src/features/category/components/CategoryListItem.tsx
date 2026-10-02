import { Pencil, Plus, Wallet } from "lucide-react";
import { Button } from "../../../components/Button";
import { Skeleton } from "../../../components/Skeleton";
import {
  ACCOUNT_ICONS,
  type AccountIcon,
} from "../../../constants/icon.constant";
import { useSubcategory } from "../hooks/useSubcategory";
import type { Category, Subcategory } from "../types/category";
import { CATEGORY_TYPE_LABELS } from "../types/category.constants";
import { SubcategoryListItem } from "./SubcategoryListItem";

interface CategoryListItemProps {
  category: Category;
  showInactive: boolean;
  onAddSubcategory: (category: Category) => void;
  onEdit: (category: Category) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
}

export function CategoryListItem({
  category,
  showInactive,
  onAddSubcategory,
  onEdit,
  onEditSubcategory,
}: CategoryListItemProps) {
  const { subcategories, isLoading } = useSubcategory(category.id, {
    includeInactive: showInactive,
  });
  const Icon = ACCOUNT_ICONS[category.icon as AccountIcon] ?? Wallet;

  return (
    <li className="rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-3 p-4">
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="size-5" />
          <span
            className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface"
            style={{ backgroundColor: category.color }}
          />
        </span>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-medium text-foreground">
            {category.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {CATEGORY_TYPE_LABELS[category.type]}
          </p>
        </div>

        {category.active ? null : (
          <span className="text-xs text-muted-foreground">Inactiva</span>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="size-9 shrink-0 px-0"
          aria-label="Editar categoría"
          onClick={() => onEdit(category)}
        >
          <Pencil className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="size-9 shrink-0 px-0"
          aria-label="Agregar subcategoría"
          onClick={() => onAddSubcategory(category)}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="border-t border-border px-4 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        ) : subcategories.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin subcategorías.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {subcategories.map((subcategory) => (
              <SubcategoryListItem
                key={subcategory.id}
                subcategory={subcategory}
                onEdit={onEditSubcategory}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
