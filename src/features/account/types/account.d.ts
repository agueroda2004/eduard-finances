import type { AccountType, Currency } from "./account.constants";

export type AccountId = string;

export interface Account {
  id: AccountId;
  ownerId: string;
  name: string;
  balance: number | null;
  icon: string;
  color: string;
  currency: Currency;
  active: boolean;
  type: AccountType;
}

export interface CreateAccountInput {
  ownerId: string;
  name: string;
  balance?: number | null;
  icon: string;
  color: string;
  currency?: Currency;
  active?: boolean;
  type: AccountType;
}

export type UpdateAccountInput = Partial<
  Omit<CreateAccountInput, "ownerId", "balance">
>;
