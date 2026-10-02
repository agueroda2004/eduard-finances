import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryRepository } from "../../../config/container";
import { useAuth } from "../../auth";
import type {
  Category,
  CategoryId,
  CreateCategoryInput,
  ListOptions,
  UpdateCategoryInput,
} from "../types/category";

export const categoryKeys = {
  all: ["categories"] as const,
  list: (ownerId: string, includeInactive: boolean) =>
    [...categoryKeys.all, "list", ownerId, includeInactive] as const,
};

export type CreateCategoryPayload = Omit<CreateCategoryInput, "ownerId">;

interface UpdateCategoryPayload {
  id: CategoryId;
  input: UpdateCategoryInput;
}

interface UseCategoryResult {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  createCategory: (payload: CreateCategoryPayload) => Promise<Category>;
  updateCategory: (payload: UpdateCategoryPayload) => Promise<Category>;
  removeCategory: (id: CategoryId) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
}

export function useCategory({
  includeInactive = false,
}: ListOptions = {}): UseCategoryResult {
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: categoryKeys.all });

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.list(userId ?? "anonymous", includeInactive),
    queryFn: () => {
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }
      return categoryRepository.findAll(userId, { includeInactive });
    },
    enabled: Boolean(userId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => {
      if (!userId) {
        throw new Error("Usuario no autenticado");
      }
      return categoryRepository.create({ ...payload, ownerId: userId });
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: UpdateCategoryPayload) =>
      categoryRepository.update(id, input),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: CategoryId) => categoryRepository.remove(id),
    onSuccess: invalidate,
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    refetch: categoriesQuery.refetch,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    removeCategory: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
