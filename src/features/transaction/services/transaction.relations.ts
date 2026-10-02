import type { Transaction } from "../types/transaction";

const TRANSACTION_STORAGE_KEY = "eduard:transactions";

function readAll(): Transaction[] {
  const raw = window.localStorage.getItem(TRANSACTION_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Transaction[]) : [];
  } catch {
    return [];
  }
}

export function hasTransactionsForAccount(accountId: string): boolean {
  return readAll().some((transaction) => transaction.accountId === accountId);
}

export function hasTransactionsForCategory(categoryId: string): boolean {
  return readAll().some(
    (transaction) => transaction.categoryId === categoryId,
  );
}

export function hasTransactionsForSubcategory(subcategoryId: string): boolean {
  return readAll().some(
    (transaction) => transaction.subcategoryId === subcategoryId,
  );
}
