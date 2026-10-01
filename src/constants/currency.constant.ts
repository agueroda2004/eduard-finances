export const CURRENCY_LOCALE = "es-CR";

export const CURRENCIES = ["CRC"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: Currency = "CRC";
