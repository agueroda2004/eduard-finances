export type AccountType = "cash" | "credit_card" | "debit_card" | "saving";

export type Currency = "CRC";

export interface Account {
  id: string;
  ownerId: string;
  name: string;
  balance: number | null;
  icon: string;
  color: string;
  currency: Currency;
  active: boolean;
  type: AccountType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountDTO {
  name: string;
  balance?: number | null;
  icon: string;
  color: string;
  currency?: Currency;
  active?: boolean;
  type: AccountType;
}

export type UpdateAccountDTO = Partial<
  Omit<CreateAccountDTO, "balance" | "currency">
>;
