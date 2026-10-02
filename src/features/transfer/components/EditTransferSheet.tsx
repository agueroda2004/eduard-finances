import { useState, type FormEvent } from "react";
import { BottomSheet } from "../../../components/BottomSheet";
import { Button } from "../../../components/Button";
import { DatePicker } from "../../../components/DatePicker";
import { Field } from "../../../components/Field";
import { IconDropdown } from "../../../components/IconDropdown";
import { Input } from "../../../components/Input";
import { formatCurrency } from "../../../utils/currency";
import { collectFieldErrors } from "../../../utils/zod";
import { toAccountOptions, useAccount } from "../../account";
import { useNotifications } from "../../notifications";
import { useTransfer } from "../hooks/useTransfer";
import type { Transfer } from "../types/transfer";
import {
  createTransferSchema,
  toTransferPayload,
  type CreateTransferFormValues,
} from "../validations/transfer.validation";

interface EditTransferSheetProps {
  open: boolean;
  onClose: () => void;
  transfer: Transfer | null;
}

export function EditTransferSheet({
  open,
  onClose,
  transfer,
}: EditTransferSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Editar transferencia">
      {open && transfer ? (
        <EditTransferForm
          key={transfer.id}
          transfer={transfer}
          onClose={onClose}
        />
      ) : null}
    </BottomSheet>
  );
}

interface EditTransferFormProps {
  transfer: Transfer;
  onClose: () => void;
}

function EditTransferForm({ transfer, onClose }: EditTransferFormProps) {
  const { updateTransfer, isUpdating } = useTransfer();
  const { accounts } = useAccount();
  const notifications = useNotifications();
  const [values, setValues] = useState<CreateTransferFormValues>({
    fromAccountId: transfer.fromAccountId,
    toAccountId: transfer.toAccountId,
    amount: String(transfer.amount),
    date: transfer.date,
    note: transfer.note ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const parsedAmount = values.amount === "" ? null : Number(values.amount);
  const amountPreview =
    parsedAmount !== null && Number.isFinite(parsedAmount)
      ? formatCurrency(parsedAmount)
      : null;

  function handleFromChange(fromAccountId: string) {
    setValues((current) => ({
      ...current,
      fromAccountId,
      toAccountId:
        current.toAccountId === fromAccountId ? "" : current.toAccountId,
    }));
  }

  function handleToChange(toAccountId: string) {
    setValues((current) => ({
      ...current,
      toAccountId,
      fromAccountId:
        current.fromAccountId === toAccountId ? "" : current.fromAccountId,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const result = createTransferSchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    try {
      await updateTransfer({
        id: transfer.id,
        input: toTransferPayload(result.data),
      });
      notifications.success("Transferencia actualizada");
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la transferencia.";
      setFormError(message);
      notifications.error("No se pudo actualizar la transferencia", {
        description: message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label="Desde"
        htmlFor="edit-transfer-from"
        error={fieldErrors.fromAccountId}
        required
      >
        <IconDropdown
          id="edit-transfer-from"
          value={values.fromAccountId}
          invalid={Boolean(fieldErrors.fromAccountId)}
          placeholder="Selecciona una cuenta"
          options={toAccountOptions(
            accounts.filter((account) => account.id !== values.toAccountId),
          )}
          onChange={handleFromChange}
        />
      </Field>

      <Field
        label="Hacia"
        htmlFor="edit-transfer-to"
        error={fieldErrors.toAccountId}
        required
      >
        <IconDropdown
          id="edit-transfer-to"
          value={values.toAccountId}
          invalid={Boolean(fieldErrors.toAccountId)}
          placeholder="Selecciona una cuenta"
          options={toAccountOptions(
            accounts.filter((account) => account.id !== values.fromAccountId),
          )}
          onChange={handleToChange}
        />
      </Field>

      <Field
        label="Monto"
        htmlFor="edit-transfer-amount"
        error={fieldErrors.amount}
        required
      >
        <Input
          id="edit-transfer-amount"
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
        label="Fecha"
        htmlFor="edit-transfer-date"
        error={fieldErrors.date}
        required
      >
        <DatePicker
          id="edit-transfer-date"
          value={values.date}
          invalid={Boolean(fieldErrors.date)}
          onChange={(date) => setValues((current) => ({ ...current, date }))}
        />
      </Field>

      <Field label="Nota" htmlFor="edit-transfer-note" error={fieldErrors.note}>
        <Input
          id="edit-transfer-note"
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
