import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
  updateTransaction,
} from "../repositories/transaction.repository.js";

const TRANSACTION_TYPES = ["income", "expense"] as const;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().nullable().optional(),
  amount: z.number().finite().positive(),
  note: z.string().trim().max(500).nullable().optional(),
  type: z.enum(TRANSACTION_TYPES),
  createdAt: dateSchema,
});

const updateTransactionSchema = createTransactionSchema.partial();

const listTransactionsQuerySchema = z.object({
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  subcategoryId: z.string().uuid().optional(),
  type: z.enum(TRANSACTION_TYPES).optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
});

export const transactionRouter = Router();

transactionRouter.use(requireAuth);

transactionRouter.get("/transactions", async (req, res) => {
  const parsed = listTransactionsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const transactions = await listTransactions(ownerId, parsed.data);
  res.json(transactions);
});

transactionRouter.get("/transactions/:id", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const transaction = await getTransaction(ownerId, req.params.id);

  if (!transaction) {
    res.status(404).json({ error: "Transacción no encontrada" });
    return;
  }

  res.json(transaction);
});

transactionRouter.post("/transactions", async (req, res) => {
  const parsed = createTransactionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const transaction = await createTransaction(ownerId, parsed.data);

  if (!transaction) {
    res.status(404).json({ error: "Cuenta o categoría no encontrada" });
    return;
  }

  res.status(201).json(transaction);
});

transactionRouter.patch("/transactions/:id", async (req, res) => {
  const parsed = updateTransactionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const transaction = await updateTransaction(
    ownerId,
    req.params.id,
    parsed.data,
  );

  if (!transaction) {
    res.status(404).json({ error: "Transacción no encontrada" });
    return;
  }

  res.json(transaction);
});

transactionRouter.delete("/transactions/:id", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const removed = await deleteTransaction(ownerId, req.params.id);

  if (!removed) {
    res.status(404).json({ error: "Transacción no encontrada" });
    return;
  }

  res.status(204).send();
});
