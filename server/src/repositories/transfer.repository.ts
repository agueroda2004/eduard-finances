import { and, eq, gte, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "../db/client.js";
import { accounts, transfers, type TransferRow } from "../db/schema.js";
import type {
  CreateTransferDTO,
  ListTransfersOptions,
  Transfer,
  UpdateTransferDTO,
} from "../types/transfer.js";

type TransactionExecutor = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];

function toTransfer(row: TransferRow): Transfer {
  return {
    id: row.id,
    ownerId: row.ownerId,
    fromAccountId: row.fromAccountId,
    toAccountId: row.toAccountId,
    amount: row.amount,
    note: row.note,
    date: row.date,
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

async function applyTransfer(
  executor: TransactionExecutor,
  ownerId: string,
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  sign: 1 | -1,
): Promise<void> {
  await applyBalanceDelta(executor, ownerId, fromAccountId, -amount * sign);
  await applyBalanceDelta(executor, ownerId, toAccountId, amount * sign);
}

export async function listTransfers(
  ownerId: string,
  { accountId, from, to }: ListTransfersOptions = {},
): Promise<Transfer[]> {
  const conditions: SQL[] = [eq(transfers.ownerId, ownerId)];

  if (accountId) {
    conditions.push(
      or(
        eq(transfers.fromAccountId, accountId),
        eq(transfers.toAccountId, accountId),
      ) as SQL,
    );
  }
  if (from) {
    conditions.push(gte(transfers.date, from));
  }
  if (to) {
    conditions.push(lte(transfers.date, to));
  }

  const rows = await db
    .select()
    .from(transfers)
    .where(and(...conditions));

  return rows.map(toTransfer);
}

export async function getTransfer(
  ownerId: string,
  id: string,
): Promise<Transfer | null> {
  const [row] = await db
    .select()
    .from(transfers)
    .where(and(eq(transfers.ownerId, ownerId), eq(transfers.id, id)));

  return row ? toTransfer(row) : null;
}

export async function createTransfer(
  ownerId: string,
  input: CreateTransferDTO,
): Promise<Transfer | null> {
  return db.transaction(async (tx) => {
    if (input.fromAccountId === input.toAccountId) {
      return null;
    }
    if (!(await ownsAccount(tx, ownerId, input.fromAccountId))) {
      return null;
    }
    if (!(await ownsAccount(tx, ownerId, input.toAccountId))) {
      return null;
    }

    const [row] = await tx
      .insert(transfers)
      .values({
        ownerId,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount: input.amount,
        note: input.note ?? null,
        date: input.date,
      })
      .returning();

    await applyTransfer(
      tx,
      ownerId,
      input.fromAccountId,
      input.toAccountId,
      input.amount,
      1,
    );

    return toTransfer(row);
  });
}

export async function updateTransfer(
  ownerId: string,
  id: string,
  input: UpdateTransferDTO,
): Promise<Transfer | null> {
  return db.transaction(async (tx) => {
    const [currentRow] = await tx
      .select()
      .from(transfers)
      .where(and(eq(transfers.ownerId, ownerId), eq(transfers.id, id)));

    if (!currentRow) {
      return null;
    }

    const current = toTransfer(currentRow);
    const fromAccountId = input.fromAccountId ?? current.fromAccountId;
    const toAccountId = input.toAccountId ?? current.toAccountId;
    const amount = input.amount ?? current.amount;

    if (fromAccountId === toAccountId) {
      return null;
    }
    if (!(await ownsAccount(tx, ownerId, fromAccountId))) {
      return null;
    }
    if (!(await ownsAccount(tx, ownerId, toAccountId))) {
      return null;
    }

    const [row] = await tx
      .update(transfers)
      .set({
        fromAccountId,
        toAccountId,
        amount,
        note: input.note === undefined ? current.note : input.note,
        date: input.date ?? current.date,
      })
      .where(and(eq(transfers.ownerId, ownerId), eq(transfers.id, id)))
      .returning();

    await applyTransfer(
      tx,
      ownerId,
      current.fromAccountId,
      current.toAccountId,
      current.amount,
      -1,
    );
    await applyTransfer(tx, ownerId, fromAccountId, toAccountId, amount, 1);

    return toTransfer(row);
  });
}

export async function deleteTransfer(
  ownerId: string,
  id: string,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [currentRow] = await tx
      .select()
      .from(transfers)
      .where(and(eq(transfers.ownerId, ownerId), eq(transfers.id, id)));

    if (!currentRow) {
      return false;
    }

    await tx
      .delete(transfers)
      .where(and(eq(transfers.ownerId, ownerId), eq(transfers.id, id)));

    await applyTransfer(
      tx,
      ownerId,
      currentRow.fromAccountId,
      currentRow.toAccountId,
      currentRow.amount,
      -1,
    );

    return true;
  });
}
