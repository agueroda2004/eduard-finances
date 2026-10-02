import { useState } from "react";
import { Eye, EyeOff, Plus } from "lucide-react";
import { Button } from "../../../components/Button";
import { ConfirmSheet } from "../../../components/ConfirmSheet";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { useNotifications } from "../../notifications";
import { CategoryListItem } from "../components/CategoryListItem";
import { CategoryListSkeleton } from "../components/CategoryListSkeleton";
import { CreateCategorySheet } from "../components/CreateCategorySheet";
import { CreateSubcategorySheet } from "../components/CreateSubcategorySheet";
import { EditCategorySheet } from "../components/EditCategorySheet";
import { EditSubcategorySheet } from "../components/EditSubcategorySheet";
import { useCategory } from "../hooks/useCategory";
import { useSubcategory } from "../hooks/useSubcategory";
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
  const {
    categories,
    isLoading,
    isError,
    removeCategory,
    isRemoving,
  } = useCategory({
    includeInactive: showInactive,
  });
  const notifications = useNotifications();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [subcategoryFor, setSubcategoryFor] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [deletingSubcategory, setDeletingSubcategory] =
    useState<Subcategory | null>(null);

  const { removeSubcategory, isRemoving: isRemovingSubcategory } =
    useSubcategory(deletingSubcategory?.categoryId ?? "");

  const visibleCategories = categories.filter(
    (category) => category.type === activeType,
  );
  const typeLabel =
    CATEGORY_TYPE_PLURAL_LABELS[activeType].toLowerCase();

  async function handleDeleteCategory() {
    if (!deletingCategory) {
      return;
    }

    try {
      await removeCategory(deletingCategory.id);
      notifications.success("Categoría eliminada");
      setDeletingCategory(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la categoría.";
      notifications.error("No se pudo eliminar la categoría", {
        description: message,
      });
    }
  }

  async function handleDeleteSubcategory() {
    if (!deletingSubcategory) {
      return;
    }

    try {
      await removeSubcategory(deletingSubcategory.id);
      notifications.success("Subcategoría eliminada");
      setDeletingSubcategory(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la subcategoría.";
      notifications.error("No se pudo eliminar la subcategoría", {
        description: message,
      });
    }
  }

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
              onDelete={setDeletingCategory}
              onEditSubcategory={setEditingSubcategory}
              onDeleteSubcategory={setDeletingSubcategory}
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

      <ConfirmSheet
        open={deletingCategory !== null}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Eliminar categoría"
        description="¿Seguro que quieres eliminar esta categoría? Solo es posible si no tiene transacciones ni subcategorías asociadas. Esta acción no se puede deshacer."
        isLoading={isRemoving}
      />

      <ConfirmSheet
        open={deletingSubcategory !== null}
        onClose={() => setDeletingSubcategory(null)}
        onConfirm={handleDeleteSubcategory}
        title="Eliminar subcategoría"
        description="¿Seguro que quieres eliminar esta subcategoría? Solo es posible si no tiene transacciones asociadas. Esta acción no se puede deshacer."
        isLoading={isRemovingSubcategory}
      />
    </div>
  );
}
