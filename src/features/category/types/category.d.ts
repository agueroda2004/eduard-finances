import type { CategoryType } from "./category.constants";

export type CategoryId = string;
export type SubcategoryId = string;

export interface ListOptions {
  includeInactive?: boolean;
}

export interface Category {
  id: CategoryId;
  ownerId: string;
  name: string;
  icon: string;
  color: string;
  active: boolean;
  type: CategoryType;
}

export interface CreateCategoryInput {
  ownerId: string;
  name: string;
  icon: string;
  color: string;
  active?: boolean;
  type: CategoryType;
}

export type UpdateCategoryInput = Partial<Omit<CreateCategoryInput, "ownerId">>;

export interface Subcategory {
  id: SubcategoryId;
  name: string;
  active: boolean;
  categoryId: CategoryId;
}

export interface CreateSubcategoryInput {
  name: string;
  categoryId: CategoryId;
  active?: boolean;
}

export type UpdateSubcategoryInput = Partial<
  Omit<CreateSubcategoryInput, "categoryId">
>;
