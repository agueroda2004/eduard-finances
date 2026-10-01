import type {
  Account,
  AccountId,
  CreateAccountInput,
  UpdateAccountInput,
} from "../types/account";
import type { AccountRepository } from "../types/account.interface";
import { DEFAULT_CURRENCY } from "../types/account.constants";

const STORAGE_KEY = "eduard:accounts";

function readAll(): Account[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Account[]) : [];
  } catch {
    return [];
  }
}

function writeAll(accounts: Account[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function createAccountLocalService(): AccountRepository {
  return {
    async findAll(ownerId) {
      return readAll().filter((account) => account.ownerId === ownerId);
    },

    async findById(id) {
      return readAll().find((account) => account.id === id) ?? null;
    },

    async create(input: CreateAccountInput) {
      const account: Account = {
        id: crypto.randomUUID(),
        ownerId: input.ownerId,
        name: input.name,
        balance: input.balance ?? null,
        icon: input.icon,
        color: input.color,
        currency: input.currency ?? DEFAULT_CURRENCY,
        active: input.active ?? true,
        type: input.type,
      };

      const accounts = readAll();
      accounts.push(account);
      writeAll(accounts);

      return account;
    },

    async update(id: AccountId, input: UpdateAccountInput) {
      const accounts = readAll();
      const index = accounts.findIndex((account) => account.id === id);
      const current = accounts[index];

      if (!current) {
        throw new Error(`No se encontró la cuenta ${id}`);
      }

      const updated: Account = {
        ...current,
        ...input,
        id,
        ownerId: current.ownerId,
        balance: current.balance,
      };
      accounts[index] = updated;
      writeAll(accounts);

      return updated;
    },

    async remove(id: AccountId) {
      const accounts = readAll();
      writeAll(accounts.filter((account) => account.id !== id));
    },
  };
}
