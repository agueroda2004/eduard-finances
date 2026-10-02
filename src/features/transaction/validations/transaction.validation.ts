import { z } from "zod";
import type { CreateTransactionInput } from "../types/transaction";
import { TRANSACTION_TYPES } from "../types/transaction.constants";

export const createTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES, { error: "Selecciona un tipo" }),
  amount: z
    .string()
    .trim()
    .min(1, "El monto es obligatorio")
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      "Monto inválido",
    ),
  accountId: z.string().min(1, "Selecciona una cuenta"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  subcategoryId: z.string(),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  note: z.string().trim().max(500, "Máximo 500 caracteres"),
});

export type CreateTransactionFormValues = z.infer<
  typeof createTransactionSchema
>;

export function toTransactionPayload(
  values: CreateTransactionFormValues,
): Omit<CreateTransactionInput, "ownerId"> {
  return {
    accountId: values.accountId,
    categoryId: values.categoryId,
    subcategoryId: values.subcategoryId === "" ? null : values.subcategoryId,
    amount: Number(values.amount),
    note: values.note === "" ? null : values.note,
    type: values.type,
    createdAt: values.createdAt,
  };
}
