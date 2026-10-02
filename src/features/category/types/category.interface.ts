import type {
  Category,
  CategoryId,
  CreateCategoryInput,
  CreateSubcategoryInput,
  ListOptions,
  Subcategory,
  SubcategoryId,
  UpdateCategoryInput,
  UpdateSubcategoryInput,
} from "./category";

export interface CategoryRepository {
  findAll(ownerId: string, options?: ListOptions): Promise<Category[]>;
  findById(id: CategoryId): Promise<Category | null>;
  create(input: CreateCategoryInput): Promise<Category>;
  update(id: CategoryId, input: UpdateCategoryInput): Promise<Category>;
  remove(id: CategoryId): Promise<void>;
}

export interface SubcategoryRepository {
  findByCategory(
    categoryId: CategoryId,
    options?: ListOptions,
  ): Promise<Subcategory[]>;
  findById(id: SubcategoryId): Promise<Subcategory | null>;
  create(input: CreateSubcategoryInput): Promise<Subcategory>;
  update(id: SubcategoryId, input: UpdateSubcategoryInput): Promise<Subcategory>;
  remove(id: SubcategoryId): Promise<void>;
}
