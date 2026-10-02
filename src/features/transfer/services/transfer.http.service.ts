import { getAuthToken } from "../../../config/auth-token";
import type {
  CreateTransferInput,
  ListTransfersOptions,
  Transfer,
  TransferId,
  UpdateTransferInput,
} from "../types/transfer";
import type { TransferRepository } from "../types/transfer.interface";

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

function buildQuery(options?: ListTransfersOptions): string {
  if (!options) {
    return "";
  }

  const params = new URLSearchParams();
  if (options.accountId) {
    params.set("accountId", options.accountId);
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

export function createTransferHttpService(): TransferRepository {
  return {
    findAll(_ownerId, options) {
      return request<Transfer[]>(`/api/transfers${buildQuery(options)}`);
    },

    findById(id) {
      return request<Transfer | null>(`/api/transfers/${id}`);
    },

    create(input: CreateTransferInput) {
      return request<Transfer>("/api/transfers", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },

    update(id: TransferId, input: UpdateTransferInput) {
      return request<Transfer>(`/api/transfers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },

    async remove(id: TransferId) {
      await request<void>(`/api/transfers/${id}`, { method: "DELETE" });
    },
  };
}
