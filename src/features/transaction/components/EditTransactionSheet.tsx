import { useState, type FormEvent } from "react";
import { BottomSheet } from "../../../components/BottomSheet";
import { Button } from "../../../components/Button";
import { DatePicker } from "../../../components/DatePicker";
import { Dropdown } from "../../../components/Dropdown";
import { Field } from "../../../components/Field";
import { IconDropdown } from "../../../components/IconDropdown";
import { Input } from "../../../components/Input";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { formatCurrency } from "../../../utils/currency";
import { collectFieldErrors } from "../../../utils/zod";
import { useAccount } from "../../account";
import { useCategory, useSubcategory } from "../../category";
import { useNotifications } from "../../notifications";
import { useTransaction } from "../hooks/useTransaction";
import type { Transaction } from "../types/transaction";
import {
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  type TransactionType,
} from "../types/transaction.constants";
import { toAccountOptions, toCategoryOptions } from "../utils/options";
import {
  createTransactionSchema,
  toTransactionPayload,
  type CreateTransactionFormValues,
} from "../validations/transaction.validation";

const TYPE_OPTIONS = TRANSACTION_TYPES.map((type) => ({
  value: type,
  label: TRANSACTION_TYPE_LABELS[type],
}));

interface EditTransactionSheetProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function EditTransactionSheet({
  open,
  onClose,
  transaction,
}: EditTransactionSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Editar transacción">
      {open && transaction ? (
        <EditTransactionForm
          key={transaction.id}
          transaction={transaction}
          onClose={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}

interface EditTransactionFormProps {
  transaction: Transaction;
  onClose: () => void;
}

function EditTransactionForm({
  transaction,
  onClose,
}: EditTransactionFormProps) {
  const { updateTransaction, isUpdating } = useTransaction();
  const { accounts } = useAccount();
  const { categories } = useCategory();
  const notifications = useNotifications();
  const [values, setValues] = useState<CreateTransactionFormValues>({
    type: transaction.type,
    amount: String(transaction.amount),
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    subcategoryId: transaction.subcategoryId ?? "",
    createdAt: transaction.createdAt,
    note: transaction.note ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const { subcategories } = useSubcategory(values.categoryId);
  const visibleCategories = categories.filter(
    (category) => category.type === values.type,
  );

  const parsedAmount = values.amount === "" ? null : Number(values.amount);
  const amountPreview =
    parsedAmount !== null && Number.isFinite(parsedAmount)
      ? formatCurrency(parsedAmount)
      : null;

  function handleTypeChange(type: TransactionType) {
    setValues((current) => ({
      ...current,
      type,
      categoryId: "",
      subcategoryId: "",
    }));
  }

  function handleCategoryChange(categoryId: string) {
    setValues((current) => ({ ...current, categoryId, subcategoryId: "" }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const result = createTransactionSchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    try {
      await updateTransaction({
        id: transaction.id,
        input: toTransactionPayload(result.data),
      });
      notifications.success("Transacción actualizada");
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la transacción.";
      setFormError(message);
      notifications.error("No se pudo actualizar la transacción", {
        description: message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Tipo" error={fieldErrors.type} required>
        <SegmentedControl
          value={values.type}
          options={TYPE_OPTIONS}
          onChange={handleTypeChange}
          className="w-full"
        />
      </Field>

      <Field
        label="Monto"
        htmlFor="edit-transaction-amount"
        error={fieldErrors.amount}
        required
      >
        <Input
          id="edit-transaction-amount"
          type="number"
          step="0.01"
          min="0"
          value={values.amount}
          placeholder="0.00"
          invalid={Boolean(fieldErrors.amount)}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              amount: event.target.value,
            }))
          }
        />
        {amountPreview ? (
          <p className="text-xs text-muted-foreground">{amountPreview}</p>
        ) : null}
      </Field>

      <Field
        label="Cuenta"
        htmlFor="edit-transaction-account"
        error={fieldErrors.accountId}
        required
      >
        <IconDropdown
          id="edit-transaction-account"
          value={values.accountId}
          invalid={Boolean(fieldErrors.accountId)}
          placeholder="Selecciona una cuenta"
          options={toAccountOptions(accounts)}
          onChange={(accountId) =>
            setValues((current) => ({ ...current, accountId }))
          }
        />
      </Field>

      <Field
        label="Categoría"
        htmlFor="edit-transaction-category"
        error={fieldErrors.categoryId}
        required
      >
        <IconDropdown
          id="edit-transaction-category"
          value={values.categoryId}
          invalid={Boolean(fieldErrors.categoryId)}
          placeholder="Selecciona una categoría"
          options={toCategoryOptions(visibleCategories)}
          onChange={handleCategoryChange}
        />
      </Field>

      {values.categoryId && subcategories.length > 0 ? (
        <Field
          label="Subcategoría"
          htmlFor="edit-transaction-subcategory"
          error={fieldErrors.subcategoryId}
        >
          <Dropdown
            id="edit-transaction-subcategory"
            value={values.subcategoryId}
            placeholder="Sin subcategoría"
            options={subcategories.map((subcategory) => ({
              value: subcategory.id,
              label: subcategory.name,
            }))}
            onChange={(subcategoryId) =>
              setValues((current) => ({ ...current, subcategoryId }))
            }
          />
        </Field>
      ) : null}

      <Field
        label="Fecha"
        htmlFor="edit-transaction-date"
        error={fieldErrors.createdAt}
        required
      >
        <DatePicker
          id="edit-transaction-date"
          value={values.createdAt}
          invalid={Boolean(fieldErrors.createdAt)}
          onChange={(createdAt) =>
            setValues((current) => ({ ...current, createdAt }))
          }
        />
      </Field>

      <Field
        label="Nota"
        htmlFor="edit-transaction-note"
        error={fieldErrors.note}
      >
        <Input
          id="edit-transaction-note"
          value={values.note}
          placeholder="Opcional"
          invalid={Boolean(fieldErrors.note)}
          onChange={(event) =>
            setValues((current) => ({ ...current, note: event.target.value }))
          }
        />
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
