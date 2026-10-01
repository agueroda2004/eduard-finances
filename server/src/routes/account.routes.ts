import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import {
  createAccount,
  deleteAccount,
  getAccount,
  listAccounts,
  updateAccount,
} from "../repositories/account.repository";

const ACCOUNT_TYPES = ["cash", "credit_card", "debit_card", "saving"] as const;
const CURRENCIES = ["CRC"] as const;

const createAccountSchema = z.object({
  name: z.string().trim().min(1).max(100),
  balance: z.number().finite().nullable().optional(),
  icon: z.string().trim().min(1).max(50),
  color: z.string().trim().min(1).max(50),
  currency: z.enum(CURRENCIES).optional(),
  active: z.boolean().optional(),
  type: z.enum(ACCOUNT_TYPES),
});

const updateAccountSchema = createAccountSchema
  .omit({ balance: true, currency: true })
  .partial();

export const accountRouter = Router();

accountRouter.use(requireAuth);

accountRouter.get("/accounts", async (_req, res) => {
  const ownerId = res.locals.ownerId as string;
  const accounts = await listAccounts(ownerId);
  res.json(accounts);
});

accountRouter.get("/accounts/:id", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const account = await getAccount(ownerId, req.params.id);

  if (!account) {
    res.status(404).json({ error: "Cuenta no encontrada" });
    return;
  }

  res.json(account);
});

accountRouter.post("/accounts", async (req, res) => {
  const parsed = createAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const account = await createAccount(ownerId, parsed.data);
  res.status(201).json(account);
});

accountRouter.patch("/accounts/:id", async (req, res) => {
  const parsed = updateAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const account = await updateAccount(ownerId, req.params.id, parsed.data);

  if (!account) {
    res.status(404).json({ error: "Cuenta no encontrada" });
    return;
  }

  res.json(account);
});

accountRouter.delete("/accounts/:id", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const removed = await deleteAccount(ownerId, req.params.id);

  if (!removed) {
    res.status(404).json({ error: "Cuenta no encontrada" });
    return;
  }

  res.status(204).send();
});
