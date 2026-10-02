import { getAuthToken } from "../../../config/auth-token";
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

const API_URL = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body && typeof body.error === "string"
        ? body.error
        : `Error ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function createCategoryHttpService(): CategoryRepository {
  return {
    findAll(_ownerId, options) {
      const query = options?.includeInactive ? "?includeInactive=true" : "";
      return request<Category[]>(`/api/categories${query}`);
    },

    findById(id) {
      return request<Category | null>(`/api/categories/${id}`);
    },

    create(input: CreateCategoryInput) {
      return request<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },

    update(id: CategoryId, input: UpdateCategoryInput) {
      return request<Category>(`/api/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },

    async remove(id: CategoryId) {
      await request<void>(`/api/categories/${id}`, { method: "DELETE" });
    },
  };
}

export function createSubcategoryHttpService(): SubcategoryRepository {
  return {
    findByCategory(categoryId, options) {
      const query = options?.includeInactive ? "?includeInactive=true" : "";
      return request<Subcategory[]>(
        `/api/categories/${categoryId}/subcategories${query}`,
      );
    },

    findById(id) {
      return request<Subcategory | null>(`/api/subcategories/${id}`);
    },

    create(input: CreateSubcategoryInput) {
      return request<Subcategory>(
        `/api/categories/${input.categoryId}/subcategories`,
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      );
    },

    update(id: SubcategoryId, input: UpdateSubcategoryInput) {
      return request<Subcategory>(`/api/subcategories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },

    async remove(id: SubcategoryId) {
      await request<void>(`/api/subcategories/${id}`, { method: "DELETE" });
    },
  };
}
