import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { BottomSheet } from "../../../components/BottomSheet";
import { Button } from "../../../components/Button";
import { Field } from "../../../components/Field";
import { Input } from "../../../components/Input";
import { Toggle } from "../../../components/Toggle";
import {
  COLOR_LABELS,
  COLOR_VALUES,
  type ColorValue,
} from "../../../constants/color.constant";
import {
  ACCOUNT_ICONS,
  ACCOUNT_ICON_NAMES,
  type AccountIcon,
} from "../../../constants/icon.constant";
import { cn } from "../../../utils/cn";
import { getContrastColor } from "../../../utils/color";
import { collectFieldErrors } from "../../../utils/zod";
import { useNotifications } from "../../notifications";
import { useCategory } from "../hooks/useCategory";
import type { Category } from "../types/category";
import {
  updateCategorySchema,
  type UpdateCategoryFormValues,
} from "../validations/category.validation";

interface EditCategorySheetProps {
  open: boolean;
  onClose: () => void;
  category: Category | null;
}

export function EditCategorySheet({
  open,
  onClose,
  category,
}: EditCategorySheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Editar categoría">
      {open && category ? (
        <EditCategoryForm
          key={category.id}
          category={category}
          onClose={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}

interface EditCategoryFormProps {
  category: Category;
  onClose: () => void;
}

function EditCategoryForm({ category, onClose }: EditCategoryFormProps) {
  const { updateCategory, isUpdating } = useCategory();
  const notifications = useNotifications();
  const [values, setValues] = useState<UpdateCategoryFormValues>({
    name: category.name,
    icon: category.icon as AccountIcon,
    color: category.color as ColorValue,
    active: category.active,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const result = updateCategorySchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    try {
      await updateCategory({ id: category.id, input: result.data });
      notifications.success("Categoría actualizada");
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la categoría.";
      setFormError(message);
      notifications.error("No se pudo actualizar la categoría", {
        description: message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label="Nombre"
        htmlFor="edit-category-name"
        error={fieldErrors.name}
        required
      >
        <Input
          id="edit-category-name"
          value={values.name}
          placeholder="Alimentación"
          invalid={Boolean(fieldErrors.name)}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
        />
      </Field>

      <Field label="Ícono" error={fieldErrors.icon} required>
        <div className="grid grid-cols-8 gap-2">
          {ACCOUNT_ICON_NAMES.map((name) => {
            const Icon = ACCOUNT_ICONS[name];
            const selected = values.icon === name;
            return (
              <button
                key={name}
                type="button"
                aria-label={name}
                aria-pressed={selected}
                onClick={() =>
                  setValues((current) => ({ ...current, icon: name }))
                }
                className={cn(
                  "flex h-9 items-center justify-center rounded-lg border transition-colors",
                  selected
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Color" error={fieldErrors.color} required>
        <div className="flex flex-wrap gap-2">
          {COLOR_VALUES.map((color) => {
            const selected = values.color === color;
            return (
              <button
                key={color}
                type="button"
                aria-label={COLOR_LABELS[color]}
                aria-pressed={selected}
                onClick={() => setValues((current) => ({ ...current, color }))}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition-transform",
                  selected ? "scale-110" : "",
                )}
                style={{ backgroundColor: color }}
              >
                {selected ? (
                  <Check
                    className="size-4"
                    style={{ color: getContrastColor(color) }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Estado" htmlFor="edit-category-active">
        <div className="flex items-center gap-3">
          <Toggle
            id="edit-category-active"
            checked={values.active}
            onChange={(active) =>
              setValues((current) => ({ ...current, active }))
            }
          />
          <span className="text-sm text-muted-foreground">
            {values.active ? "Activa" : "Inactiva"}
          </span>
        </div>
      </Field>

      {formError ? <p className="text-sm text-danger">{formError}</p> : null}

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
