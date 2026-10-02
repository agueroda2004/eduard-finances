import { useState, type FormEvent } from "react";
import { BottomSheet } from "../../../components/BottomSheet";
import { Button } from "../../../components/Button";
import { Field } from "../../../components/Field";
import { Input } from "../../../components/Input";
import { Toggle } from "../../../components/Toggle";
import { collectFieldErrors } from "../../../utils/zod";
import { useNotifications } from "../../notifications";
import { useSubcategory } from "../hooks/useSubcategory";
import type { Subcategory } from "../types/category";
import {
  updateSubcategorySchema,
  type UpdateSubcategoryFormValues,
} from "../validations/category.validation";

interface EditSubcategorySheetProps {
  open: boolean;
  onClose: () => void;
  subcategory: Subcategory | null;
}

export function EditSubcategorySheet({
  open,
  onClose,
  subcategory,
}: EditSubcategorySheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Editar subcategoría">
      {open && subcategory ? (
        <EditSubcategoryForm
          key={subcategory.id}
          subcategory={subcategory}
          onClose={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}

interface EditSubcategoryFormProps {
  subcategory: Subcategory;
  onClose: () => void;
}

function EditSubcategoryForm({
  subcategory,
  onClose,
}: EditSubcategoryFormProps) {
  const { updateSubcategory, isUpdating } = useSubcategory(
    subcategory.categoryId,
  );
  const notifications = useNotifications();
  const [values, setValues] = useState<UpdateSubcategoryFormValues>({
    name: subcategory.name,
    active: subcategory.active,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const result = updateSubcategorySchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    try {
      await updateSubcategory({ id: subcategory.id, input: result.data });
      notifications.success("Subcategoría actualizada");
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la subcategoría.";
      setFormError(message);
      notifications.error("No se pudo actualizar la subcategoría", {
        description: message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label="Nombre"
        htmlFor="edit-subcategory-name"
        error={fieldErrors.name}
        required
      >
        <Input
          id="edit-subcategory-name"
          value={values.name}
          placeholder="Supermercado"
          invalid={Boolean(fieldErrors.name)}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
        />
      </Field>

      <Field label="Estado" htmlFor="edit-subcategory-active">
        <div className="flex items-center gap-3">
          <Toggle
            id="edit-subcategory-active"
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
