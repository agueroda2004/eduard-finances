export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  ownerId: string;
  accountId: string;
  categoryId: string;
  subcategoryId: string | null;
  amount: number;
  note: string | null;
  type: TransactionType;
  createdAt: string;
}

export interface CreateTransactionDTO {
  accountId: string;
  categoryId: string;
  subcategoryId?: string | null;
  amount: number;
  note?: string | null;
  type: TransactionType;
  createdAt: string;
}

export type UpdateTransactionDTO = Partial<CreateTransactionDTO>;

export interface ListTransactionsOptions {
  accountId?: string;
  categoryId?: string;
  subcategoryId?: string;
  type?: TransactionType;
  from?: string;
  to?: string;
}
