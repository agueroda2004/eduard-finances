import { useState, type FormEvent } from "react";
import { BottomSheet } from "../../../components/BottomSheet";
import { Button } from "../../../components/Button";
import { Field } from "../../../components/Field";
import { Input } from "../../../components/Input";
import { collectFieldErrors } from "../../../utils/zod";
import { useNotifications } from "../../notifications";
import { useSubcategory } from "../hooks/useSubcategory";
import type { Category } from "../types/category";
import {
  createSubcategorySchema,
  type CreateSubcategoryFormValues,
} from "../validations/category.validation";

const emptyValues: CreateSubcategoryFormValues = { name: "" };

interface CreateSubcategorySheetProps {
  open: boolean;
  onClose: () => void;
  category: Category | null;
}

export function CreateSubcategorySheet({
  open,
  onClose,
  category,
}: CreateSubcategorySheetProps) {
  const { createSubcategory, isCreating } = useSubcategory(category?.id ?? "");
  const notifications = useNotifications();
  const [values, setValues] = useState<CreateSubcategoryFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  function handleClose() {
    setValues(emptyValues);
    setFieldErrors({});
    setFormError("");
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const result = createSubcategorySchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    try {
      await createSubcategory({ name: result.data.name });
      notifications.success("Subcategoría creada");
      handleClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo crear la subcategoría.";
      setFormError(message);
      notifications.error("No se pudo crear la subcategoría", {
        description: message,
      });
    }
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Nueva subcategoría">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {category ? (
          <p className="text-xs text-muted-foreground">
            Categoría: <span className="text-foreground">{category.name}</span>
          </p>
        ) : null}

        <Field
          label="Nombre"
          htmlFor="subcategory-name"
          error={fieldErrors.name}
          required
        >
          <Input
            id="subcategory-name"
            value={values.name}
            placeholder="Supermercado"
            invalid={Boolean(fieldErrors.name)}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
          />
        </Field>

        {formError ? <p className="text-sm text-danger">{formError}</p> : null}

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isCreating || !category}>
            {isCreating ? "Guardando..." : "Crear subcategoría"}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
