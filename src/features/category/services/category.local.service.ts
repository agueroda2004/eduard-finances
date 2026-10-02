import type {
  Category,
  CategoryId,
  CreateCategoryInput,
  CreateSubcategoryInput,
  Subcategory,
  SubcategoryId,
  UpdateCategoryInput,
  UpdateSubcategoryInput,
} from "../types/category";
import type {
  CategoryRepository,
  SubcategoryRepository,
} from "../types/category.interface";

const CATEGORY_STORAGE_KEY = "eduard:categories";
const SUBCATEGORY_STORAGE_KEY = "eduard:subcategories";

function readAll<T>(key: string): T[] {
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeAll<T>(key: string, items: T[]): void {
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function createCategoryLocalService(): CategoryRepository {
  return {
    async findAll(ownerId, options) {
      return readAll<Category>(CATEGORY_STORAGE_KEY).filter(
        (category) =>
          category.ownerId === ownerId &&
          (options?.includeInactive || category.active),
      );
    },

    async findById(id) {
      return (
        readAll<Category>(CATEGORY_STORAGE_KEY).find(
          (category) => category.id === id,
        ) ?? null
      );
    },

    async create(input: CreateCategoryInput) {
      const category: Category = {
        id: crypto.randomUUID(),
        ownerId: input.ownerId,
        name: input.name,
        icon: input.icon,
        color: input.color,
        active: input.active ?? true,
        type: input.type,
      };

      const categories = readAll<Category>(CATEGORY_STORAGE_KEY);
      categories.push(category);
      writeAll(CATEGORY_STORAGE_KEY, categories);

      return category;
    },

    async update(id: CategoryId, input: UpdateCategoryInput) {
      const categories = readAll<Category>(CATEGORY_STORAGE_KEY);
      const index = categories.findIndex((category) => category.id === id);
      const current = categories[index];

      if (!current) {
        throw new Error(`No se encontró la categoría ${id}`);
      }

      const updated: Category = {
        ...current,
        ...input,
        id,
        ownerId: current.ownerId,
      };
      categories[index] = updated;
      writeAll(CATEGORY_STORAGE_KEY, categories);

      return updated;
    },

    async remove(id: CategoryId) {
      const categories = readAll<Category>(CATEGORY_STORAGE_KEY);
      writeAll(
        CATEGORY_STORAGE_KEY,
        categories.filter((category) => category.id !== id),
      );

      const subcategories = readAll<Subcategory>(SUBCATEGORY_STORAGE_KEY);
      writeAll(
        SUBCATEGORY_STORAGE_KEY,
        subcategories.filter((subcategory) => subcategory.categoryId !== id),
      );
    },
  };
}

export function createSubcategoryLocalService(): SubcategoryRepository {
  return {
    async findByCategory(categoryId, options) {
      return readAll<Subcategory>(SUBCATEGORY_STORAGE_KEY).filter(
        (subcategory) =>
          subcategory.categoryId === categoryId &&
          (options?.includeInactive || subcategory.active),
      );
    },

    async findById(id) {
      return (
        readAll<Subcategory>(SUBCATEGORY_STORAGE_KEY).find(
          (subcategory) => subcategory.id === id,
        ) ?? null
      );
    },

    async create(input: CreateSubcategoryInput) {
      const subcategory: Subcategory = {
        id: crypto.randomUUID(),
        name: input.name,
        categoryId: input.categoryId,
        active: input.active ?? true,
      };

      const subcategories = readAll<Subcategory>(SUBCATEGORY_STORAGE_KEY);
      subcategories.push(subcategory);
      writeAll(SUBCATEGORY_STORAGE_KEY, subcategories);

      return subcategory;
    },

    async update(id: SubcategoryId, input: UpdateSubcategoryInput) {
      const subcategories = readAll<Subcategory>(SUBCATEGORY_STORAGE_KEY);
      const index = subcategories.findIndex(
        (subcategory) => subcategory.id === id,
      );
      const current = subcategories[index];

      if (!current) {
        throw new Error(`No se encontró la subcategoría ${id}`);
      }

      const updated: Subcategory = {
        ...current,
        ...input,
        id,
        categoryId: current.categoryId,
      };
      subcategories[index] = updated;
      writeAll(SUBCATEGORY_STORAGE_KEY, subcategories);

      return updated;
    },

    async remove(id: SubcategoryId) {
      const subcategories = readAll<Subcategory>(SUBCATEGORY_STORAGE_KEY);
      writeAll(
        SUBCATEGORY_STORAGE_KEY,
        subcategories.filter((subcategory) => subcategory.id !== id),
      );
    },
  };
}
