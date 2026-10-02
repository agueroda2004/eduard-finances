import { useState } from "react";
import { Eye, EyeOff, Plus } from "lucide-react";
import { Button } from "../../../components/Button";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { CategoryListItem } from "../components/CategoryListItem";
import { CategoryListSkeleton } from "../components/CategoryListSkeleton";
import { CreateCategorySheet } from "../components/CreateCategorySheet";
import { CreateSubcategorySheet } from "../components/CreateSubcategorySheet";
import { EditCategorySheet } from "../components/EditCategorySheet";
import { EditSubcategorySheet } from "../components/EditSubcategorySheet";
import { useCategory } from "../hooks/useCategory";
import type { Category, Subcategory } from "../types/category";
import {
  CATEGORY_TYPE_PLURAL_LABELS,
  type CategoryType,
} from "../types/category.constants";

const TYPE_TABS: { value: CategoryType; label: string }[] = [
  { value: "expense", label: CATEGORY_TYPE_PLURAL_LABELS.expense },
  { value: "income", label: CATEGORY_TYPE_PLURAL_LABELS.income },
];

export function CategoriesPage() {
  const [showInactive, setShowInactive] = useState(false);
  const [activeType, setActiveType] = useState<CategoryType>("expense");
  const { categories, isLoading, isError } = useCategory({
    includeInactive: showInactive,
  });
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [subcategoryFor, setSubcategoryFor] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);

  const visibleCategories = categories.filter(
    (category) => category.type === activeType,
  );
  const typeLabel =
    CATEGORY_TYPE_PLURAL_LABELS[activeType].toLowerCase();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            Administra tus categorías.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-pressed={showInactive}
            onClick={() => setShowInactive((current) => !current)}
          >
            {showInactive ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
            {showInactive ? "Ocultar inactivas" : "Ver inactivas"}
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nueva categoría
          </Button>
        </div>
      </div>

      <SegmentedControl
        value={activeType}
        options={TYPE_TABS}
        onChange={setActiveType}
        className="w-full sm:w-auto"
      />

      {isLoading ? (
        <CategoryListSkeleton />
      ) : isError ? (
        <p className="text-sm text-danger">
          No se pudieron cargar las categorías.
        </p>
      ) : visibleCategories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {showInactive
              ? `Aún no tienes categorías de ${typeLabel}.`
              : `Aún no tienes categorías de ${typeLabel} activas.`}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visibleCategories.map((category) => (
            <CategoryListItem
              key={category.id}
              category={category}
              showInactive={showInactive}
              onAddSubcategory={setSubcategoryFor}
              onEdit={setEditingCategory}
              onEditSubcategory={setEditingSubcategory}
            />
          ))}
        </ul>
      )}

      <CreateCategorySheet
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
      />

      <EditCategorySheet
        open={editingCategory !== null}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
      />

      <CreateSubcategorySheet
        open={subcategoryFor !== null}
        category={subcategoryFor}
        onClose={() => setSubcategoryFor(null)}
      />

      <EditSubcategorySheet
        open={editingSubcategory !== null}
        subcategory={editingSubcategory}
        onClose={() => setEditingSubcategory(null)}
      />
    </div>
  );
}
