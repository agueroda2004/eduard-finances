import {
  adjustAccountBalanceLocal,
  hasAccountLocal,
} from "../../account/services/account.local.service";
import type {
  CreateTransactionInput,
  ListTransactionsOptions,
  Transaction,
  TransactionId,
  UpdateTransactionInput,
} from "../types/transaction";
import type { TransactionType } from "../types/transaction.constants";
import type { TransactionRepository } from "../types/transaction.interface";

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

function writeAll(items: Transaction[]): void {
  window.localStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(items));
}

function signedAmount(type: TransactionType, amount: number): number {
  return type === "income" ? amount : -amount;
}

function matchesOptions(
  transaction: Transaction,
  options: ListTransactionsOptions,
): boolean {
  if (options.accountId && transaction.accountId !== options.accountId) {
    return false;
  }
  if (options.categoryId && transaction.categoryId !== options.categoryId) {
    return false;
  }
  if (
    options.subcategoryId &&
    transaction.subcategoryId !== options.subcategoryId
  ) {
    return false;
  }
  if (options.type && transaction.type !== options.type) {
    return false;
  }
  if (options.from && transaction.createdAt < options.from) {
    return false;
  }
  if (options.to && transaction.createdAt > options.to) {
    return false;
  }

  return true;
}

export function createTransactionLocalService(): TransactionRepository {
  return {
    async findAll(ownerId, options = {}) {
      return readAll().filter(
        (transaction) =>
          transaction.ownerId === ownerId &&
          matchesOptions(transaction, options),
      );
    },

    async findById(id) {
      return readAll().find((transaction) => transaction.id === id) ?? null;
    },

    async create(input: CreateTransactionInput) {
      if (!hasAccountLocal(input.ownerId, input.accountId)) {
        throw new Error("Cuenta no encontrada");
      }

      const transaction: Transaction = {
        id: crypto.randomUUID(),
        ownerId: input.ownerId,
        accountId: input.accountId,
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId ?? null,
        amount: input.amount,
        note: input.note ?? null,
        type: input.type,
        createdAt: input.createdAt,
      };

      adjustAccountBalanceLocal(
        input.ownerId,
        input.accountId,
        signedAmount(input.type, input.amount),
      );

      const transactions = readAll();
      transactions.push(transaction);
      writeAll(transactions);

      return transaction;
    },

    async update(id: TransactionId, input: UpdateTransactionInput) {
      const transactions = readAll();
      const index = transactions.findIndex(
        (transaction) => transaction.id === id,
      );
      const current = transactions[index];

      if (!current) {
        throw new Error(`No se encontró la transacción ${id}`);
      }

      const updated: Transaction = {
        ...current,
        ...input,
        id,
        ownerId: current.ownerId,
        subcategoryId:
          input.subcategoryId === undefined
            ? current.subcategoryId
            : input.subcategoryId,
      };

      if (
        !hasAccountLocal(current.ownerId, current.accountId) ||
        !hasAccountLocal(current.ownerId, updated.accountId)
      ) {
        throw new Error("Cuenta no encontrada");
      }

      const oldDelta = signedAmount(current.type, current.amount);
      const newDelta = signedAmount(updated.type, updated.amount);

      if (current.accountId === updated.accountId) {
        if (newDelta !== oldDelta) {
          adjustAccountBalanceLocal(
            current.ownerId,
            updated.accountId,
            newDelta - oldDelta,
          );
        }
      } else {
        adjustAccountBalanceLocal(
          current.ownerId,
          current.accountId,
          -oldDelta,
        );
        adjustAccountBalanceLocal(current.ownerId, updated.accountId, newDelta);
      }

      transactions[index] = updated;
      writeAll(transactions);

      return updated;
    },

    async remove(id: TransactionId) {
      const transactions = readAll();
      const current = transactions.find((transaction) => transaction.id === id);

      if (!current) {
        return;
      }

      adjustAccountBalanceLocal(
        current.ownerId,
        current.accountId,
        -signedAmount(current.type, current.amount),
      );

      writeAll(transactions.filter((transaction) => transaction.id !== id));
    },
  };
}
