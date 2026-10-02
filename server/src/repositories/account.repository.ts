import { and, eq, or } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  accounts,
  transactions,
  transfers,
  type AccountRow,
} from "../db/schema.js";
import type {
  Account,
  CreateAccountDTO,
  UpdateAccountDTO,
} from "../types/account.js";
import type { DeleteResult } from "../types/common.js";

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    balance: row.balance,
    icon: row.icon,
    color: row.color,
    currency: row.currency,
    active: row.active,
    type: row.type,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAccounts(
  ownerId: string,
  { includeInactive = false }: { includeInactive?: boolean } = {},
): Promise<Account[]> {
  const conditions = [eq(accounts.ownerId, ownerId)];
  if (!includeInactive) {
    conditions.push(eq(accounts.active, true));
  }

  const rows = await db
    .select()
    .from(accounts)
    .where(and(...conditions));

  return rows.map(toAccount);
}

export async function getAccount(
  ownerId: string,
  id: string,
): Promise<Account | null> {
  const [row] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.ownerId, ownerId), eq(accounts.id, id)));

  return row ? toAccount(row) : null;
}

export async function createAccount(
  ownerId: string,
  input: CreateAccountDTO,
): Promise<Account> {
  const [row] = await db
    .insert(accounts)
    .values({
      ownerId,
      name: input.name,
      balance: input.balance ?? null,
      icon: input.icon,
      color: input.color,
      currency: input.currency ?? "CRC",
      active: input.active ?? true,
      type: input.type,
    })
    .returning();

  return toAccount(row);
}

export async function updateAccount(
  ownerId: string,
  id: string,
  input: UpdateAccountDTO,
): Promise<Account | null> {
  const [row] = await db
    .update(accounts)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(accounts.ownerId, ownerId), eq(accounts.id, id)))
    .returning();

  return row ? toAccount(row) : null;
}

export async function deleteAccount(
  ownerId: string,
  id: string,
): Promise<DeleteResult> {
  return db.transaction(async (tx) => {
    const [account] = await tx
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.ownerId, ownerId), eq(accounts.id, id)));

    if (!account) {
      return "not_found";
    }

    const [transaction] = await tx
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(
          eq(transactions.ownerId, ownerId),
          eq(transactions.accountId, id),
        ),
      )
      .limit(1);

    if (transaction) {
      return "in_use";
    }

    const [transfer] = await tx
      .select({ id: transfers.id })
      .from(transfers)
      .where(
        and(
          eq(transfers.ownerId, ownerId),
          or(eq(transfers.fromAccountId, id), eq(transfers.toAccountId, id)),
        ),
      )
      .limit(1);

    if (transfer) {
      return "in_use";
    }

    await tx
      .delete(accounts)
      .where(and(eq(accounts.ownerId, ownerId), eq(accounts.id, id)));

    return "deleted";
  });
}
