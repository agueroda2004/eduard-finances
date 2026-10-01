import { z } from "zod";
import { COLOR_VALUES } from "../../../constants/color.constant";
import { ACCOUNT_ICON_NAMES } from "../../../constants/icon.constant";
import { ACCOUNT_TYPES, CURRENCIES } from "../types/account.constants";

export const createAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  type: z.enum(ACCOUNT_TYPES, { error: "Selecciona un tipo" }),
  currency: z.enum(CURRENCIES, { error: "Selecciona una moneda" }),
  balance: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || Number.isFinite(Number(value)),
      "Monto inválido",
    ),
  icon: z.enum(ACCOUNT_ICON_NAMES, { error: "Selecciona un ícono" }),
  color: z.enum(COLOR_VALUES, { error: "Selecciona un color" }),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = createAccountSchema.omit({
  balance: true,
  currency: true,
});

export type UpdateAccountFormValues = z.infer<typeof updateAccountSchema>;
