export {
  CURRENCIES,
  DEFAULT_CURRENCY,
} from "../../../constants/currency.constant";
export type { Currency } from "../../../constants/currency.constant";

export const ACCOUNT_TYPES = [
  "cash",
  "credit_card",
  "debit_card",
  "saving",
] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: "Efectivo",
  credit_card: "Tarjeta de crédito",
  debit_card: "Tarjeta de débito",
  saving: "Ahorros",
};
