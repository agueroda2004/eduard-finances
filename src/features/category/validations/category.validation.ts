import { z } from "zod";
import { COLOR_VALUES } from "../../../constants/color.constant";
import { ACCOUNT_ICON_NAMES } from "../../../constants/icon.constant";
import { CATEGORY_TYPES } from "../types/category.constants";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  type: z.enum(CATEGORY_TYPES, { error: "Selecciona un tipo" }),
  icon: z.enum(ACCOUNT_ICON_NAMES, { error: "Selecciona un ícono" }),
  color: z.enum(COLOR_VALUES, { error: "Selecciona un color" }),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema
  .omit({ type: true })
  .extend({ active: z.boolean() });

export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;

export const createSubcategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(50, "Máximo 50 caracteres"),
});

export type CreateSubcategoryFormValues = z.infer<
  typeof createSubcategorySchema
>;

export const updateSubcategorySchema = createSubcategorySchema.extend({
  active: z.boolean(),
});

export type UpdateSubcategoryFormValues = z.infer<
  typeof updateSubcategorySchema
>;
