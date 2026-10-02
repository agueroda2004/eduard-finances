import { useState, type FormEvent } from "react";
import { BottomSheet } from "../../../components/BottomSheet";
import { Button } from "../../../components/Button";
import { DatePicker } from "../../../components/DatePicker";
import { Field } from "../../../components/Field";
import { IconDropdown } from "../../../components/IconDropdown";
import { Input } from "../../../components/Input";
import { formatCurrency } from "../../../utils/currency";
import { todayIso } from "../../../utils/date";
import { collectFieldErrors } from "../../../utils/zod";
import { toAccountOptions, useAccount } from "../../account";
import { useNotifications } from "../../notifications";
import { useTransfer } from "../hooks/useTransfer";
import {
  createTransferSchema,
  toTransferPayload,
  type CreateTransferFormValues,
} from "../validations/transfer.validation";

function createEmptyValues(): CreateTransferFormValues {
  return {
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    date: todayIso(),
    note: "",
  };
}

interface CreateTransferSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTransferSheet({
  open,
  onClose,
}: CreateTransferSheetProps) {
  const { createTransfer, isCreating } = useTransfer();
  const { accounts } = useAccount();
  const notifications = useNotifications();
  const [values, setValues] = useState<CreateTransferFormValues>(
    createEmptyValues,
  );
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

  function handleClose() {
    setValues(createEmptyValues());
    setFieldErrors({});
    setFormError("");
    onClose();
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
      await createTransfer(toTransferPayload(result.data));
      notifications.success("Transferencia creada");
      handleClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo crear la transferencia.";
      setFormError(message);
      notifications.error("No se pudo crear la transferencia", {
        description: message,
      });
    }
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Nueva transferencia">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          label="Desde"
          htmlFor="transfer-from"
          error={fieldErrors.fromAccountId}
          required
        >
          <IconDropdown
            id="transfer-from"
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
          htmlFor="transfer-to"
          error={fieldErrors.toAccountId}
          required
        >
          <IconDropdown
            id="transfer-to"
            value={values.toAccountId}
            invalid={Boolean(fieldErrors.toAccountId)}
            placeholder="Selecciona una cuenta"
            options={toAccountOptions(
              accounts.filter(
                (account) => account.id !== values.fromAccountId,
              ),
            )}
            onChange={handleToChange}
          />
        </Field>

        <Field
          label="Monto"
          htmlFor="transfer-amount"
          error={fieldErrors.amount}
          required
        >
          <Input
            id="transfer-amount"
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
          htmlFor="transfer-date"
          error={fieldErrors.date}
          required
        >
          <DatePicker
            id="transfer-date"
            value={values.date}
            invalid={Boolean(fieldErrors.date)}
            onChange={(date) => setValues((current) => ({ ...current, date }))}
          />
        </Field>

        <Field label="Nota" htmlFor="transfer-note" error={fieldErrors.note}>
          <Input
            id="transfer-note"
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
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Guardando..." : "Crear transferencia"}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
