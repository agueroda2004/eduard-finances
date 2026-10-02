import { Pencil } from "lucide-react";
import { Button } from "../../../components/Button";
import type { Subcategory } from "../types/category";

interface SubcategoryListItemProps {
  subcategory: Subcategory;
  onEdit: (subcategory: Subcategory) => void;
}

export function SubcategoryListItem({
  subcategory,
  onEdit,
}: SubcategoryListItemProps) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-foreground">
        {subcategory.name}
      </span>
      {subcategory.active ? null : (
        <span className="text-xs text-muted-foreground">Inactiva</span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="size-8 shrink-0 px-0"
        aria-label="Editar subcategoría"
        onClick={() => onEdit(subcategory)}
      >
        <Pencil className="size-3.5" />
      </Button>
    </li>
  );
}
