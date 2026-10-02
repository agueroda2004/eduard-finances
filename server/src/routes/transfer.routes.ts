import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import {
  createTransfer,
  deleteTransfer,
  getTransfer,
  listTransfers,
  updateTransfer,
} from "../repositories/transfer.repository.js";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const createTransferSchema = z
  .object({
    fromAccountId: z.string().uuid(),
    toAccountId: z.string().uuid(),
    amount: z.number().finite().positive(),
    note: z.string().trim().max(500).nullable().optional(),
    date: dateSchema,
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    error: "Las cuentas deben ser distintas",
    path: ["toAccountId"],
  });

const updateTransferSchema = z
  .object({
    fromAccountId: z.string().uuid().optional(),
    toAccountId: z.string().uuid().optional(),
    amount: z.number().finite().positive().optional(),
    note: z.string().trim().max(500).nullable().optional(),
    date: dateSchema.optional(),
  })
  .refine(
    (data) =>
      !data.fromAccountId ||
      !data.toAccountId ||
      data.fromAccountId !== data.toAccountId,
    { error: "Las cuentas deben ser distintas", path: ["toAccountId"] },
  );

const listTransfersQuerySchema = z.object({
  accountId: z.string().uuid().optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
});

export const transferRouter = Router();

transferRouter.use(requireAuth);

transferRouter.get("/transfers", async (req, res) => {
  const parsed = listTransfersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const transfers = await listTransfers(ownerId, parsed.data);
  res.json(transfers);
});

transferRouter.get("/transfers/:id", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const transfer = await getTransfer(ownerId, req.params.id);

  if (!transfer) {
    res.status(404).json({ error: "Transferencia no encontrada" });
    return;
  }

  res.json(transfer);
});

transferRouter.post("/transfers", async (req, res) => {
  const parsed = createTransferSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const transfer = await createTransfer(ownerId, parsed.data);

  if (!transfer) {
    res.status(404).json({ error: "Cuenta no encontrada" });
    return;
  }

  res.status(201).json(transfer);
});

transferRouter.patch("/transfers/:id", async (req, res) => {
  const parsed = updateTransferSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const transfer = await updateTransfer(ownerId, req.params.id, parsed.data);

  if (!transfer) {
    res.status(404).json({ error: "Transferencia no encontrada" });
    return;
  }

  res.json(transfer);
});

transferRouter.delete("/transfers/:id", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const removed = await deleteTransfer(ownerId, req.params.id);

  if (!removed) {
    res.status(404).json({ error: "Transferencia no encontrada" });
    return;
  }

  res.status(204).send();
});
