import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import {
  createAccount,
  deleteAccount,
  getAccount,
  listAccounts,
  updateAccount,
} from "../repositories/account.repository.js";

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

accountRouter.get("/accounts", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const includeInactive = req.query.includeInactive === "true";
  const accounts = await listAccounts(ownerId, { includeInactive });
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
  const result = await deleteAccount(ownerId, req.params.id);

  if (result === "not_found") {
    res.status(404).json({ error: "Cuenta no encontrada" });
    return;
  }

  if (result === "in_use") {
    res.status(409).json({
      error:
        "No se puede eliminar la cuenta porque tiene transacciones o transferencias asociadas.",
    });
    return;
  }

  res.status(204).send();
});
