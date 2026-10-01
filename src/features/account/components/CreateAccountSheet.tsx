import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { BottomSheet } from "../../../components/BottomSheet";
import { Button } from "../../../components/Button";
import { Dropdown } from "../../../components/Dropdown";
import { Field } from "../../../components/Field";
import { Input } from "../../../components/Input";
import { COLOR_LABELS, COLOR_VALUES } from "../../../constants/color.constant";
import { ACCOUNT_ICONS, ACCOUNT_ICON_NAMES } from "../../../constants/icon.constant";
import { cn } from "../../../utils/cn";
import { getContrastColor } from "../../../utils/color";
import { formatCurrency } from "../../../utils/currency";
import { collectFieldErrors } from "../../../utils/zod";
import { useNotifications } from "../../notifications";
import { useAccount } from "../hooks/useAccount";
import {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  DEFAULT_CURRENCY,
} from "../types/account.constants";
import {
  createAccountSchema,
  type CreateAccountFormValues,
} from "../validations/account.validation";

const emptyValues: CreateAccountFormValues = {
  name: "",
  type: "cash",
  currency: DEFAULT_CURRENCY,
  balance: "",
  icon: "wallet",
  color: COLOR_VALUES[0],
};

interface CreateAccountSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAccountSheet({ open, onClose }: CreateAccountSheetProps) {
  const { createAccount, isCreating } = useAccount();
  const notifications = useNotifications();
  const [values, setValues] = useState<CreateAccountFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const parsedBalance = values.balance === "" ? null : Number(values.balance);
  const balancePreview =
    parsedBalance !== null && Number.isFinite(parsedBalance)
      ? formatCurrency(parsedBalance)
      : null;

  function handleClose() {
    setValues(emptyValues);
    setFieldErrors({});
    setFormError("");
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const result = createAccountSchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error));
      return;
    }
    setFieldErrors({});

    try {
      await createAccount({
        name: result.data.name,
        type: result.data.type,
        currency: result.data.currency,
        balance: result.data.balance === "" ? null : Number(result.data.balance),
        icon: result.data.icon,
        color: result.data.color,
      });
      notifications.success("Cuenta creada");
      handleClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear la cuenta.";
      setFormError(message);
      notifications.error("No se pudo crear la cuenta", { description: message });
    }
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Nueva cuenta">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Nombre" htmlFor="account-name" error={fieldErrors.name} required>
          <Input
            id="account-name"
            value={values.name}
            placeholder="Cuenta de ahorros"
            invalid={Boolean(fieldErrors.name)}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
          />
        </Field>

        <Field label="Tipo" htmlFor="account-type" error={fieldErrors.type} required>
          <Dropdown
            id="account-type"
            value={values.type}
            invalid={Boolean(fieldErrors.type)}
            options={ACCOUNT_TYPES.map((type) => ({
              value: type,
              label: ACCOUNT_TYPE_LABELS[type],
            }))}
            onChange={(type) =>
              setValues((current) => ({ ...current, type }))
            }
          />
        </Field>

        <Field
          label="Saldo inicial"
          htmlFor="account-balance"
          error={fieldErrors.balance}
        >
          <Input
            id="account-balance"
            type="number"
            step="0.01"
            value={values.balance}
            placeholder="0.00"
            invalid={Boolean(fieldErrors.balance)}
            onChange={(event) =>
              setValues((current) => ({ ...current, balance: event.target.value }))
            }
          />
          {balancePreview ? (
            <p className="text-xs text-muted-foreground">{balancePreview}</p>
          ) : null}
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

        {formError ? <p className="text-sm text-danger">{formError}</p> : null}

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Guardando..." : "Crear cuenta"}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
