import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { accounts, type AccountRow } from "../db/schema.js";
import type {
  Account,
  CreateAccountDTO,
  UpdateAccountDTO,
} from "../types/account.js";

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

export async function listAccounts(ownerId: string): Promise<Account[]> {
  const rows = await db
    .select()
    .from(accounts)
    .where(eq(accounts.ownerId, ownerId));

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
): Promise<boolean> {
  const rows = await db
    .delete(accounts)
    .where(and(eq(accounts.ownerId, ownerId), eq(accounts.id, id)))
    .returning({ id: accounts.id });

  return rows.length > 0;
}
