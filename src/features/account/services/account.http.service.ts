import { getAuthToken } from "../../../config/auth-token";
import type {
  Account,
  AccountId,
  CreateAccountInput,
  UpdateAccountInput,
} from "../types/account";
import type { AccountRepository } from "../types/account.interface";

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

export function createAccountHttpService(): AccountRepository {
  return {
    findAll() {
      return request<Account[]>("/api/accounts");
    },

    findById(id) {
      return request<Account | null>(`/api/accounts/${id}`);
    },

    create(input: CreateAccountInput) {
      return request<Account>("/api/accounts", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },

    update(id: AccountId, input: UpdateAccountInput) {
      return request<Account>(`/api/accounts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },

    async remove(id: AccountId) {
      await request<void>(`/api/accounts/${id}`, { method: "DELETE" });
    },
  };
}
