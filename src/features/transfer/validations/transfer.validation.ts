import { z } from "zod";
import type { CreateTransferInput } from "../types/transfer";

export const createTransferSchema = z
  .object({
    fromAccountId: z.string().min(1, "Selecciona una cuenta"),
    toAccountId: z.string().min(1, "Selecciona una cuenta"),
    amount: z
      .string()
      .trim()
      .min(1, "El monto es obligatorio")
      .refine(
        (value) => Number.isFinite(Number(value)) && Number(value) > 0,
        "Monto inválido",
      ),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    note: z.string().trim().max(500, "Máximo 500 caracteres"),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    error: "Las cuentas deben ser distintas",
    path: ["toAccountId"],
  });

export type CreateTransferFormValues = z.infer<typeof createTransferSchema>;

export function toTransferPayload(
  values: CreateTransferFormValues,
): Omit<CreateTransferInput, "ownerId"> {
  return {
    fromAccountId: values.fromAccountId,
    toAccountId: values.toAccountId,
    amount: Number(values.amount),
    note: values.note === "" ? null : values.note,
    date: values.date,
  };
}
