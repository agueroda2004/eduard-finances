import type { TransactionType } from "./transaction.constants";

export type TransactionId = string;

export interface ListTransactionsOptions {
  accountId?: string;
  categoryId?: string;
  subcategoryId?: string;
  type?: TransactionType;
  from?: string;
  to?: string;
}

export interface Transaction {
  id: TransactionId;
  ownerId: string;
  accountId: string;
  categoryId: string;
  subcategoryId: string | null;
  amount: number;
  note: string | null;
  type: TransactionType;
  createdAt: string;
}

export interface CreateTransactionInput {
  ownerId: string;
  accountId: string;
  categoryId: string;
  subcategoryId?: string | null;
  amount: number;
  note?: string | null;
  type: TransactionType;
  createdAt: string;
}

export type UpdateTransactionInput = Partial<
  Omit<CreateTransactionInput, "ownerId">
>;
