import { getAuthToken } from "../../../config/auth-token";
import type {
  CreateTransactionInput,
  ListTransactionsOptions,
  Transaction,
  TransactionId,
  UpdateTransactionInput,
} from "../types/transaction";
import type { TransactionRepository } from "../types/transaction.interface";

const API_URL = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body.error === "string"
        ? body.error
        : `Error ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function buildQuery(options?: ListTransactionsOptions): string {
  if (!options) {
    return "";
  }

  const params = new URLSearchParams();
  if (options.accountId) {
    params.set("accountId", options.accountId);
  }
  if (options.categoryId) {
    params.set("categoryId", options.categoryId);
  }
  if (options.subcategoryId) {
    params.set("subcategoryId", options.subcategoryId);
  }
  if (options.type) {
    params.set("type", options.type);
  }
  if (options.from) {
    params.set("from", options.from);
  }
  if (options.to) {
    params.set("to", options.to);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function createTransactionHttpService(): TransactionRepository {
  return {
    findAll(_ownerId, options) {
      return request<Transaction[]>(`/api/transactions${buildQuery(options)}`);
    },

    findById(id) {
      return request<Transaction | null>(`/api/transactions/${id}`);
    },

    create(input: CreateTransactionInput) {
      return request<Transaction>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },

    update(id: TransactionId, input: UpdateTransactionInput) {
      return request<Transaction>(`/api/transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },

    async remove(id: TransactionId) {
      await request<void>(`/api/transactions/${id}`, { method: "DELETE" });
    },
  };
}
