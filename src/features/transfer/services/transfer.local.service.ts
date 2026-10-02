import {
  adjustAccountBalanceLocal,
  hasAccountLocal,
} from "../../account/services/account.local.service";
import type {
  CreateTransferInput,
  ListTransfersOptions,
  Transfer,
  TransferId,
  UpdateTransferInput,
} from "../types/transfer";
import type { TransferRepository } from "../types/transfer.interface";

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

function writeAll(items: Transfer[]): void {
  window.localStorage.setItem(TRANSFER_STORAGE_KEY, JSON.stringify(items));
}

function applyTransferLocal(
  ownerId: string,
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  sign: 1 | -1,
): void {
  adjustAccountBalanceLocal(ownerId, fromAccountId, -amount * sign);
  adjustAccountBalanceLocal(ownerId, toAccountId, amount * sign);
}

function matchesOptions(
  transfer: Transfer,
  options: ListTransfersOptions,
): boolean {
  if (
    options.accountId &&
    transfer.fromAccountId !== options.accountId &&
    transfer.toAccountId !== options.accountId
  ) {
    return false;
  }
  if (options.from && transfer.date < options.from) {
    return false;
  }
  if (options.to && transfer.date > options.to) {
    return false;
  }

  return true;
}

export function createTransferLocalService(): TransferRepository {
  return {
    async findAll(ownerId, options = {}) {
      return readAll().filter(
        (transfer) =>
          transfer.ownerId === ownerId &&
          matchesOptions(transfer, options),
      );
    },

    async findById(id) {
      return readAll().find((transfer) => transfer.id === id) ?? null;
    },

    async create(input: CreateTransferInput) {
      if (input.fromAccountId === input.toAccountId) {
        throw new Error("Las cuentas deben ser distintas");
      }
      if (
        !hasAccountLocal(input.ownerId, input.fromAccountId) ||
        !hasAccountLocal(input.ownerId, input.toAccountId)
      ) {
        throw new Error("Cuenta no encontrada");
      }

      const transfer: Transfer = {
        id: crypto.randomUUID(),
        ownerId: input.ownerId,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount: input.amount,
        note: input.note ?? null,
        date: input.date,
      };

      applyTransferLocal(
        input.ownerId,
        input.fromAccountId,
        input.toAccountId,
        input.amount,
        1,
      );

      const transfers = readAll();
      transfers.push(transfer);
      writeAll(transfers);

      return transfer;
    },

    async update(id: TransferId, input: UpdateTransferInput) {
      const transfers = readAll();
      const index = transfers.findIndex((transfer) => transfer.id === id);
      const current = transfers[index];

      if (!current) {
        throw new Error(`No se encontró la transferencia ${id}`);
      }

      const updated: Transfer = {
        ...current,
        ...input,
        id,
        ownerId: current.ownerId,
      };

      if (updated.fromAccountId === updated.toAccountId) {
        throw new Error("Las cuentas deben ser distintas");
      }
      if (
        !hasAccountLocal(current.ownerId, current.fromAccountId) ||
        !hasAccountLocal(current.ownerId, current.toAccountId) ||
        !hasAccountLocal(current.ownerId, updated.fromAccountId) ||
        !hasAccountLocal(current.ownerId, updated.toAccountId)
      ) {
        throw new Error("Cuenta no encontrada");
      }

      applyTransferLocal(
        current.ownerId,
        current.fromAccountId,
        current.toAccountId,
        current.amount,
        -1,
      );
      applyTransferLocal(
        current.ownerId,
        updated.fromAccountId,
        updated.toAccountId,
        updated.amount,
        1,
      );

      transfers[index] = updated;
      writeAll(transfers);

      return updated;
    },

    async remove(id: TransferId) {
      const transfers = readAll();
      const current = transfers.find((transfer) => transfer.id === id);

      if (!current) {
        return;
      }

      applyTransferLocal(
        current.ownerId,
        current.fromAccountId,
        current.toAccountId,
        current.amount,
        -1,
      );

      writeAll(transfers.filter((transfer) => transfer.id !== id));
    },
  };
}
