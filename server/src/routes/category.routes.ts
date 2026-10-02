import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  getCategory,
  getSubcategory,
  listCategories,
  listSubcategories,
  updateCategory,
  updateSubcategory,
} from "../repositories/category.repository.js";

const CATEGORY_TYPES = ["income", "expense"] as const;

const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  icon: z.string().trim().min(1).max(50),
  color: z.string().trim().min(1).max(50),
  active: z.boolean().optional(),
  type: z.enum(CATEGORY_TYPES),
});

const updateCategorySchema = createCategorySchema.partial();

const createSubcategorySchema = z.object({
  name: z.string().trim().min(1).max(50),
  active: z.boolean().optional(),
});

const updateSubcategorySchema = createSubcategorySchema.partial();

export const categoryRouter = Router();

categoryRouter.use(requireAuth);

categoryRouter.get("/categories", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const includeInactive = req.query.includeInactive === "true";
  const categories = await listCategories(ownerId, { includeInactive });
  res.json(categories);
});

categoryRouter.get("/categories/:id", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const category = await getCategory(ownerId, req.params.id);

  if (!category) {
    res.status(404).json({ error: "Categoría no encontrada" });
    return;
  }

  res.json(category);
});

categoryRouter.post("/categories", async (req, res) => {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const category = await createCategory(ownerId, parsed.data);
  res.status(201).json(category);
});

categoryRouter.patch("/categories/:id", async (req, res) => {
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const category = await updateCategory(ownerId, req.params.id, parsed.data);

  if (!category) {
    res.status(404).json({ error: "Categoría no encontrada" });
    return;
  }

  res.json(category);
});

categoryRouter.delete("/categories/:id", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const result = await deleteCategory(ownerId, req.params.id);

  if (result === "not_found") {
    res.status(404).json({ error: "Categoría no encontrada" });
    return;
  }

  if (result === "in_use") {
    res.status(409).json({
      error:
        "No se puede eliminar la categoría porque tiene transacciones o subcategorías asociadas.",
    });
    return;
  }

  res.status(204).send();
});

categoryRouter.get("/categories/:categoryId/subcategories", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const includeInactive = req.query.includeInactive === "true";
  const subcategories = await listSubcategories(ownerId, req.params.categoryId, {
    includeInactive,
  });
  res.json(subcategories);
});

categoryRouter.post("/categories/:categoryId/subcategories", async (req, res) => {
  const parsed = createSubcategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const subcategory = await createSubcategory(ownerId, {
    ...parsed.data,
    categoryId: req.params.categoryId,
  });

  if (!subcategory) {
    res.status(404).json({ error: "Categoría no encontrada" });
    return;
  }

  res.status(201).json(subcategory);
});

categoryRouter.get("/subcategories/:id", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const subcategory = await getSubcategory(ownerId, req.params.id);

  if (!subcategory) {
    res.status(404).json({ error: "Subcategoría no encontrada" });
    return;
  }

  res.json(subcategory);
});

categoryRouter.patch("/subcategories/:id", async (req, res) => {
  const parsed = updateSubcategorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const ownerId = res.locals.ownerId as string;
  const subcategory = await updateSubcategory(ownerId, req.params.id, parsed.data);

  if (!subcategory) {
    res.status(404).json({ error: "Subcategoría no encontrada" });
    return;
  }

  res.json(subcategory);
});

categoryRouter.delete("/subcategories/:id", async (req, res) => {
  const ownerId = res.locals.ownerId as string;
  const result = await deleteSubcategory(ownerId, req.params.id);

  if (result === "not_found") {
    res.status(404).json({ error: "Subcategoría no encontrada" });
    return;
  }

  if (result === "in_use") {
    res.status(409).json({
      error:
        "No se puede eliminar la subcategoría porque tiene transacciones asociadas.",
    });
    return;
  }

  res.status(204).send();
});
