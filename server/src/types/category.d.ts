export type CategoryType = "income" | "expense";

export interface Category {
  id: string;
  ownerId: string;
  name: string;
  icon: string;
  color: string;
  active: boolean;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDTO {
  name: string;
  icon: string;
  color: string;
  active?: boolean;
  type: CategoryType;
}

export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;

export interface Subcategory {
  id: string;
  name: string;
  active: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubcategoryDTO {
  name: string;
  categoryId: string;
  active?: boolean;
}

export type UpdateSubcategoryDTO = Partial<
  Omit<CreateSubcategoryDTO, "categoryId">
>;
