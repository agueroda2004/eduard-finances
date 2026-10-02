import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subcategoryRepository } from "../../../config/container";
import type {
  CategoryId,
  CreateSubcategoryInput,
  ListOptions,
  Subcategory,
  SubcategoryId,
  UpdateSubcategoryInput,
} from "../types/category";

export const subcategoryKeys = {
  all: ["subcategories"] as const,
  byCategory: (categoryId: CategoryId, includeInactive: boolean) =>
    [...subcategoryKeys.all, "list", categoryId, includeInactive] as const,
};

export type CreateSubcategoryPayload = Omit<
  CreateSubcategoryInput,
  "categoryId"
>;

interface UpdateSubcategoryPayload {
  id: SubcategoryId;
  input: UpdateSubcategoryInput;
}

interface UseSubcategoryResult {
  subcategories: Subcategory[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  createSubcategory: (
    payload: CreateSubcategoryPayload,
  ) => Promise<Subcategory>;
  updateSubcategory: (
    payload: UpdateSubcategoryPayload,
  ) => Promise<Subcategory>;
  removeSubcategory: (id: SubcategoryId) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
}

export function useSubcategory(
  categoryId: CategoryId,
  { includeInactive = false }: ListOptions = {},
): UseSubcategoryResult {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: subcategoryKeys.all });

  const subcategoriesQuery = useQuery({
    queryKey: subcategoryKeys.byCategory(categoryId, includeInactive),
    queryFn: () =>
      subcategoryRepository.findByCategory(categoryId, { includeInactive }),
    enabled: Boolean(categoryId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSubcategoryPayload) =>
      subcategoryRepository.create({ ...payload, categoryId }),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: UpdateSubcategoryPayload) =>
      subcategoryRepository.update(id, input),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: SubcategoryId) => subcategoryRepository.remove(id),
    onSuccess: invalidate,
  });

  return {
    subcategories: subcategoriesQuery.data ?? [],
    isLoading: subcategoriesQuery.isLoading,
    isError: subcategoriesQuery.isError,
    error: subcategoriesQuery.error,
    refetch: subcategoriesQuery.refetch,
    createSubcategory: createMutation.mutateAsync,
    updateSubcategory: updateMutation.mutateAsync,
    removeSubcategory: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
