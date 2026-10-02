import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  categories,
  subcategories,
  type CategoryRow,
  type SubcategoryRow,
} from "../db/schema.js";
import type {
  Category,
  CreateCategoryDTO,
  CreateSubcategoryDTO,
  Subcategory,
  UpdateCategoryDTO,
  UpdateSubcategoryDTO,
} from "../types/category.js";

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    icon: row.icon,
    color: row.color,
    active: row.active,
    type: row.type,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toSubcategory(row: SubcategoryRow): Subcategory {
  return {
    id: row.id,
    name: row.name,
    active: row.active,
    categoryId: row.categoryId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function ownedCategoryIds(ownerId: string) {
  return db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.ownerId, ownerId));
}

export async function listCategories(
  ownerId: string,
  { includeInactive = false }: { includeInactive?: boolean } = {},
): Promise<Category[]> {
  const conditions = [eq(categories.ownerId, ownerId)];
  if (!includeInactive) {
    conditions.push(eq(categories.active, true));
  }

  const rows = await db
    .select()
    .from(categories)
    .where(and(...conditions));

  return rows.map(toCategory);
}

export async function getCategory(
  ownerId: string,
  id: string,
): Promise<Category | null> {
  const [row] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.ownerId, ownerId), eq(categories.id, id)));

  return row ? toCategory(row) : null;
}

export async function createCategory(
  ownerId: string,
  input: CreateCategoryDTO,
): Promise<Category> {
  const [row] = await db
    .insert(categories)
    .values({
      ownerId,
      name: input.name,
      icon: input.icon,
      color: input.color,
      active: input.active ?? true,
      type: input.type,
    })
    .returning();

  return toCategory(row);
}

export async function updateCategory(
  ownerId: string,
  id: string,
  input: UpdateCategoryDTO,
): Promise<Category | null> {
  const [row] = await db
    .update(categories)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(categories.ownerId, ownerId), eq(categories.id, id)))
    .returning();

  return row ? toCategory(row) : null;
}

export async function deleteCategory(
  ownerId: string,
  id: string,
): Promise<boolean> {
  const rows = await db
    .delete(categories)
    .where(and(eq(categories.ownerId, ownerId), eq(categories.id, id)))
    .returning({ id: categories.id });

  return rows.length > 0;
}

export async function listSubcategories(
  ownerId: string,
  categoryId: string,
  { includeInactive = false }: { includeInactive?: boolean } = {},
): Promise<Subcategory[]> {
  const conditions = [
    eq(categories.ownerId, ownerId),
    eq(subcategories.categoryId, categoryId),
  ];
  if (!includeInactive) {
    conditions.push(eq(subcategories.active, true));
  }

  const rows = await db
    .select()
    .from(subcategories)
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(and(...conditions));

  return rows.map((row) => toSubcategory(row.subcategories));
}

export async function getSubcategory(
  ownerId: string,
  id: string,
): Promise<Subcategory | null> {
  const [row] = await db
    .select()
    .from(subcategories)
    .innerJoin(categories, eq(subcategories.categoryId, categories.id))
    .where(and(eq(categories.ownerId, ownerId), eq(subcategories.id, id)));

  return row ? toSubcategory(row.subcategories) : null;
}

export async function createSubcategory(
  ownerId: string,
  input: CreateSubcategoryDTO,
): Promise<Subcategory | null> {
  const [owned] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(eq(categories.ownerId, ownerId), eq(categories.id, input.categoryId)),
    );

  if (!owned) {
    return null;
  }

  const [row] = await db
    .insert(subcategories)
    .values({
      name: input.name,
      categoryId: input.categoryId,
      active: input.active ?? true,
    })
    .returning();

  return toSubcategory(row);
}

export async function updateSubcategory(
  ownerId: string,
  id: string,
  input: UpdateSubcategoryDTO,
): Promise<Subcategory | null> {
  const [row] = await db
    .update(subcategories)
    .set({ ...input, updatedAt: new Date() })
    .where(
      and(
        eq(subcategories.id, id),
        inArray(subcategories.categoryId, ownedCategoryIds(ownerId)),
      ),
    )
    .returning();

  return row ? toSubcategory(row) : null;
}

export async function deleteSubcategory(
  ownerId: string,
  id: string,
): Promise<boolean> {
  const rows = await db
    .delete(subcategories)
    .where(
      and(
        eq(subcategories.id, id),
        inArray(subcategories.categoryId, ownedCategoryIds(ownerId)),
      ),
    )
    .returning({ id: subcategories.id });

  return rows.length > 0;
}
