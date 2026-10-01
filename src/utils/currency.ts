import {
  CURRENCY_LOCALE,
  DEFAULT_CURRENCY,
  type Currency,
} from "../constants/currency.constant";

export function formatCurrency(
  amount: number,
  currency: Currency = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency,
  }).format(amount);
}
