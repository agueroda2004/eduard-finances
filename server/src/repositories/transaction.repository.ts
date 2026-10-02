import { and, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  accounts,
  categories,
  subcategories,
  transactions,
  type TransactionRow,
} from "../db/schema.js";
import type {
  CreateTransactionDTO,
  ListTransactionsOptions,
  Transaction,
  TransactionType,
  UpdateTransactionDTO,
} from "../types/transaction.js";

type TransactionExecutor = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

function signedAmount(type: TransactionType, amount: number): number {
  return type === "income" ? amount : -amount;
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    ownerId: row.ownerId,
    accountId: row.accountId,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,
    amount: row.amount,
    note: row.note,
    type: row.type,
    createdAt: row.createdAt,
  };
}

async function ownsAccount(
  executor: TransactionExecutor,
  ownerId: string,
  accountId: string,
): Promise<boolean> {
  const [row] = await executor
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.ownerId, ownerId), eq(accounts.id, accountId)));

  return Boolean(row);
}

async function ownsCategory(
  executor: TransactionExecutor,
  ownerId: string,
  categoryId: string,
): Promise<boolean> {
  const [row] = await executor
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.ownerId, ownerId), eq(categories.id, categoryId)));

  return Boolean(row);
}

async function subcategoryBelongsTo(
  executor: TransactionExecutor,
  categoryId: string,
  subcategoryId: string,
): Promise<boolean> {
  const [row] = await executor
    .select({ id: subcategories.id })
    .from(subcategories)
    .where(
      and(
        eq(subcategories.id, subcategoryId),
        eq(subcategories.categoryId, categoryId),
      ),
    );

  return Boolean(row);
}

async function applyBalanceDelta(
  executor: TransactionExecutor,
  ownerId: string,
  accountId: string,
  delta: number,
): Promise<void> {
  await executor
    .update(accounts)
    .set({
      balance: sql`coalesce(${accounts.balance}, 0) + ${delta}`,
      updatedAt: new Date(),
    })
    .where(and(eq(accounts.id, accountId), eq(accounts.ownerId, ownerId)));
}

export async function listTransactions(
  ownerId: string,
  {
    accountId,
    categoryId,
    subcategoryId,
    type,
    from,
    to,
  }: ListTransactionsOptions = {},
): Promise<Transaction[]> {
  const conditions: SQL[] = [eq(transactions.ownerId, ownerId)];

  if (accountId) {
    conditions.push(eq(transactions.accountId, accountId));
  }
  if (categoryId) {
    conditions.push(eq(transactions.categoryId, categoryId));
  }
  if (subcategoryId) {
    conditions.push(eq(transactions.subcategoryId, subcategoryId));
  }
  if (type) {
    conditions.push(eq(transactions.type, type));
  }
  if (from) {
    conditions.push(gte(transactions.createdAt, from));
  }
  if (to) {
    conditions.push(lte(transactions.createdAt, to));
  }

  const rows = await db
    .select()
    .from(transactions)
    .where(and(...conditions));

  return rows.map(toTransaction);
}

export async function getTransaction(
  ownerId: string,
  id: string,
): Promise<Transaction | null> {
  const [row] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.ownerId, ownerId), eq(transactions.id, id)));

  return row ? toTransaction(row) : null;
}

export async function createTransaction(
  ownerId: string,
  input: CreateTransactionDTO,
): Promise<Transaction | null> {
  return db.transaction(async (tx) => {
    if (!(await ownsAccount(tx, ownerId, input.accountId))) {
      return null;
    }
    if (!(await ownsCategory(tx, ownerId, input.categoryId))) {
      return null;
    }
    if (
      input.subcategoryId &&
      !(await subcategoryBelongsTo(tx, input.categoryId, input.subcategoryId))
    ) {
      return null;
    }

    const [row] = await tx
      .insert(transactions)
      .values({
        ownerId,
        accountId: input.accountId,
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId ?? null,
        amount: input.amount,
        note: input.note ?? null,
        type: input.type,
        createdAt: input.createdAt,
      })
      .returning();

    await applyBalanceDelta(
      tx,
      ownerId,
      input.accountId,
      signedAmount(input.type, input.amount),
    );

    return toTransaction(row);
  });
}

export async function updateTransaction(
  ownerId: string,
  id: string,
  input: UpdateTransactionDTO,
): Promise<Transaction | null> {
  return db.transaction(async (tx) => {
    const [currentRow] = await tx
      .select()
      .from(transactions)
      .where(and(eq(transactions.ownerId, ownerId), eq(transactions.id, id)));

    if (!currentRow) {
      return null;
    }

    const current = toTransaction(currentRow);
    const accountId = input.accountId ?? current.accountId;
    const categoryId = input.categoryId ?? current.categoryId;
    const subcategoryId =
      input.subcategoryId === undefined
        ? current.subcategoryId
        : input.subcategoryId;
    const amount = input.amount ?? current.amount;
    const type = input.type ?? current.type;

    if (!(await ownsAccount(tx, ownerId, accountId))) {
      return null;
    }
    if (!(await ownsCategory(tx, ownerId, categoryId))) {
      return null;
    }
    if (
      subcategoryId &&
      !(await subcategoryBelongsTo(tx, categoryId, subcategoryId))
    ) {
      return null;
    }

    const [row] = await tx
      .update(transactions)
      .set({
        accountId,
        categoryId,
        subcategoryId: subcategoryId ?? null,
        amount,
        note: input.note === undefined ? current.note : input.note,
        type,
        createdAt: input.createdAt ?? current.createdAt,
      })
      .where(and(eq(transactions.ownerId, ownerId), eq(transactions.id, id)))
      .returning();

    const oldDelta = signedAmount(current.type, current.amount);
    const newDelta = signedAmount(type, amount);

    if (current.accountId === accountId) {
      if (newDelta !== oldDelta) {
        await applyBalanceDelta(tx, ownerId, accountId, newDelta - oldDelta);
      }
    } else {
      await applyBalanceDelta(tx, ownerId, current.accountId, -oldDelta);
      await applyBalanceDelta(tx, ownerId, accountId, newDelta);
    }

    return toTransaction(row);
  });
}

export async function deleteTransaction(
  ownerId: string,
  id: string,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [currentRow] = await tx
      .select()
      .from(transactions)
      .where(and(eq(transactions.ownerId, ownerId), eq(transactions.id, id)));

    if (!currentRow) {
      return false;
    }

    await tx
      .delete(transactions)
      .where(and(eq(transactions.ownerId, ownerId), eq(transactions.id, id)));

    await applyBalanceDelta(
      tx,
      ownerId,
      currentRow.accountId,
      -signedAmount(currentRow.type, currentRow.amount),
    );

    return true;
  });
}
