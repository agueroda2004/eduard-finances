import type { Transfer } from "../types/transfer";

const TRANSFER_STORAGE_KEY = "eduard:transfers";

function readAll(): Transfer[] {
  const raw = window.localStorage.getItem(TRANSFER_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Transfer[]) : [];
  } catch {
    return [];
  }
}

export function hasTransfersForAccount(accountId: string): boolean {
  return readAll().some(
    (transfer) =>
      transfer.fromAccountId === accountId ||
      transfer.toAccountId === accountId,
  );
}
