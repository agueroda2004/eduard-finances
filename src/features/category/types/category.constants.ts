export const CATEGORY_TYPES = ["income", "expense"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  income: "Ingreso",
  expense: "Gasto",
};

export const CATEGORY_TYPE_PLURAL_LABELS: Record<CategoryType, string> = {
  income: "Ingresos",
  expense: "Gastos",
};
