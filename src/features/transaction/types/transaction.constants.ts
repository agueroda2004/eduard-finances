export const TRANSACTION_TYPES = ["income", "expense"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Ingreso",
  expense: "Gasto",
};

export const TRANSACTION_TYPE_PLURAL_LABELS: Record<TransactionType, string> = {
  income: "Ingresos",
  expense: "Gastos",
};
